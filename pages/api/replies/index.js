const containsAllMention = (text) => /(^|\s)@all\b/i.test(text || "");

const buildMentionEmailHtml = ({
  threadTitle,
  authorName,
  body,
  groupSlug,
  threadId,
  baseUrl,
}) => {
  const safeTitle = threadTitle || "Discussion thread";
  const safeAuthor = authorName || "A member";
  const safeBody = body || "";
  const safeGroupSlug = groupSlug || "";
  const threadUrl = `${baseUrl}/groups/${encodeURIComponent(safeGroupSlug)}?thread=${encodeURIComponent(threadId)}`;

  return `
    <div>
      <h2>You were mentioned in a discussion</h2>
      <p><strong>${safeAuthor}</strong> used <strong>@all</strong> in <em>${safeTitle}</em>.</p>
      <p style="white-space: pre-wrap;">${safeBody}</p>
      <p><a href="${threadUrl}">Open thread</a></p>
    </div>
  `;
};

const loadThreadRecord = async ({ baseId, apiKey, threadId }) => {
  const threadTable = process.env.AIRTABLE_THREADS_TABLE_NAME || "Threads";
  const threadBaseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(threadTable)}`;
  const response = await fetch(`${threadBaseUrl}/${threadId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return {
    title: data.fields?.Title || "",
    groupSlug: data.fields?.GroupSlug || "",
    authorEmail: data.fields?.AuthorEmail || "",
  };
};

const loadReplyAuthorEmails = async ({ baseUrl, apiKey, threadId }) => {
  const filter = `filterByFormula=${encodeURIComponent(`{ThreadId}='${threadId}'`)}`;
  const response = await fetch(`${baseUrl}?${filter}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.records || []).map((record) => record.fields?.AuthorEmail || "").filter(Boolean);
};

const filterEmailDigestEnabled = async ({ baseId, apiKey, emails }) => {
  const prefTable = process.env.AIRTABLE_PREFERENCES_TABLE_NAME || "Preferences";
  const prefBaseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(prefTable)}`;
  const allowed = [];

  await Promise.all(
    emails.map(async (email) => {
      const filter = `filterByFormula=${encodeURIComponent(`{UserEmail}='${email}'`)}`;
      const response = await fetch(`${prefBaseUrl}?${filter}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const record = data.records?.[0];
      if (!record || record.fields?.EmailDigests !== false) {
        allowed.push(email);
      }
    })
  );

  return allowed;
};

const notifyAllParticipants = async ({
  baseId,
  apiKey,
  repliesBaseUrl,
  threadId,
  fallbackThreadTitle,
  fallbackGroupSlug,
  authorName,
  authorEmail,
  body,
}) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendApiKey || !resendFrom) {
    return { sent: 0, skipped: true, reason: "Missing Resend configuration" };
  }

  const threadRecord = await loadThreadRecord({ baseId, apiKey, threadId });
  const threadTitle = threadRecord?.title || fallbackThreadTitle || "Discussion thread";
  const groupSlug = threadRecord?.groupSlug || fallbackGroupSlug || "";
  const threadAuthorEmail = threadRecord?.authorEmail || "";
  const replyAuthorEmails = await loadReplyAuthorEmails({
    baseUrl: repliesBaseUrl,
    apiKey,
    threadId,
  });

  const uniqueTargets = [...new Set([threadAuthorEmail, ...replyAuthorEmails])]
    .filter(Boolean)
    .filter((email) => email.toLowerCase() !== (authorEmail || "").toLowerCase());

  if (uniqueTargets.length === 0) {
    return { sent: 0, skipped: true, reason: "No recipients" };
  }

  const optedInTargets = await filterEmailDigestEnabled({
    baseId,
    apiKey,
    emails: uniqueTargets,
  });
  if (optedInTargets.length === 0) {
    return { sent: 0, skipped: true, reason: "Recipients opted out" };
  }

  const appBaseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://community.themimir.com";
  const html = buildMentionEmailHtml({
    threadTitle,
    authorName,
    body,
    groupSlug,
    threadId,
    baseUrl: appBaseUrl,
  });

  let sent = 0;
  await Promise.all(
    optedInTargets.map(async (toEmail) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: toEmail,
          subject: `@all mention in ${threadTitle}`,
          html,
        }),
      });
      if (response.ok) sent += 1;
    })
  );

  return { sent, skipped: false };
};

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
      let mentionNotification = null;
      if (containsAllMention(body)) {
        try {
          mentionNotification = await notifyAllParticipants({
            baseId,
            apiKey,
            repliesBaseUrl: baseUrl,
            threadId,
            fallbackThreadTitle: threadTitle,
            fallbackGroupSlug: groupSlug,
            authorName,
            authorEmail,
            body,
          });
        } catch (error) {
          mentionNotification = { sent: 0, skipped: true, reason: "Notification failed" };
        }
      }

      res.status(201).json({ id: data.records?.[0]?.id, mentionNotification });
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
