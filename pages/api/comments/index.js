export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_COMMENTS_TABLE_NAME;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !tableName || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  if (req.method === "GET") {
    const { threadId } = req.query;
    if (!threadId) {
      res.status(400).json({ error: "Thread id is required" });
      return;
    }

    const filter = `&filterByFormula=${encodeURIComponent(`{ThreadId}='${threadId}'`)}`;

    try {
      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=asc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch comments" });
        return;
      }

      const data = await response.json();
      const comments = (data.records || []).map((record) => ({
        id: record.id,
        threadId: record.fields.ThreadId || "",
        authorName: record.fields.AuthorName || "Member",
        authorAvatar: record.fields.AuthorAvatar || "sunrise",
        createdAt: record.fields.CreatedAt || null,
        body: record.fields.Body || "",
      }));

      res.status(200).json({ comments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const { threadId, authorName, authorAvatar, body } = req.body || {};
      if (!threadId || !body) {
        res.status(400).json({ error: "Thread and body are required" });
        return;
      }

      const response = await fetch(baseUrl, {
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
                AuthorName: authorName || "Member",
                AuthorAvatar: authorAvatar || "sunrise",
                Body: body,
                CreatedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create comment" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
