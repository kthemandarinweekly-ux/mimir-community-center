export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_REPLIES_TABLE_NAME || "Replies";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch replies by thread or user
  if (req.method === "GET") {
    const { threadId, authorEmail, countOnly } = req.query;

    try {
      let filter = "";
      if (threadId && authorEmail) {
        filter = `&filterByFormula=OR({ThreadId}='${threadId}',{AuthorEmail}='${authorEmail}')`;
      } else if (threadId) {
        filter = `&filterByFormula=${encodeURIComponent(`{ThreadId}='${threadId}'`)}`;
      } else if (authorEmail) {
        filter = `&filterByFormula=${encodeURIComponent(`{AuthorEmail}='${authorEmail}'`)}`;
      }

      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=asc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch replies" });
        return;
      }

      const data = await response.json();
      const replies = (data.records || []).map((record) => ({
        id: record.id,
        threadId: record.fields.ThreadId || "",
        threadTitle: record.fields.ThreadTitle || "",
        groupSlug: record.fields.GroupSlug || "",
        authorName: record.fields.AuthorName || "Member",
        authorEmail: record.fields.AuthorEmail || "",
        authorAvatar: record.fields.AuthorAvatar || "sunrise",
        parentReplyId: record.fields.ParentReplyId || "",
        likeCount: Number(record.fields.LikeCount || 0),
        body: record.fields.Body || "",
        createdAt: record.fields.CreatedAt || null,
      }));
      if (countOnly === "true") {
        res.status(200).json({ count: replies.length });
      } else {
        res.status(200).json({ replies });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch replies" });
    }
    return;
  }

  // POST - Create a reply
  if (req.method === "POST") {
    try {
      const { threadId, threadTitle, groupSlug, authorName, authorEmail, authorAvatar, parentReplyId, body } = req.body || {};
      if (!threadId || !body) {
        res.status(400).json({ error: "Thread ID and body are required" });
        return;
      }

      const fields = {
        ThreadId: threadId,
        ThreadTitle: threadTitle || "",
        GroupSlug: groupSlug || "",
        AuthorName: authorName || "Member",
        AuthorEmail: authorEmail || "",
        AuthorAvatar: authorAvatar || "sunrise",
        ParentReplyId: parentReplyId || "",
        LikeCount: 0,
        Body: body,
        CreatedAt: new Date().toISOString(),
      };

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields,
            },
          ],
        }),
      });

      if (!response.ok) {
        if (parentReplyId) {
          res.status(400).json({
            error: "Nested replies require a ParentReplyId field in Airtable Replies table",
          });
          return;
        }

        // Backward-compatible fallback for Airtable bases without new fields.
        const fallbackResponse = await fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  ThreadId: threadId,
                  ThreadTitle: threadTitle || "",
                  GroupSlug: groupSlug || "",
                  AuthorName: authorName || "Member",
                  AuthorEmail: authorEmail || "",
                  AuthorAvatar: authorAvatar || "sunrise",
                  Body: body,
                  CreatedAt: new Date().toISOString(),
                },
              },
            ],
          }),
        });

        if (!fallbackResponse.ok) {
          res.status(fallbackResponse.status).json({ error: "Failed to create reply" });
          return;
        }
        const fallbackData = await fallbackResponse.json();
        res.status(201).json({ id: fallbackData.records?.[0]?.id });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create reply" });
    }
    return;
  }

  // PATCH - Update like count for a reply
  if (req.method === "PATCH") {
    try {
      const { replyId, likeCount } = req.body || {};
      if (!replyId || typeof likeCount !== "number") {
        res.status(400).json({ error: "Reply ID and like count are required" });
        return;
      }

      const response = await fetch(baseUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              id: replyId,
              fields: {
                LikeCount: Math.max(0, likeCount),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to update like count" });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update like count" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
