export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_THREADS_TABLE_NAME;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !tableName || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  if (req.method === "GET") {
    const { groupSlug } = req.query;
    const filter = groupSlug
      ? `&filterByFormula=${encodeURIComponent(`{GroupSlug}='${groupSlug}'`)}`
      : "";

    try {
      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch threads" });
        return;
      }

      const data = await response.json();
      const threads = (data.records || []).map((record) => ({
        id: record.id,
        title: record.fields.Title || "Untitled",
        groupSlug: record.fields.GroupSlug || "",
        authorName: record.fields.AuthorName || "Member",
        authorAvatar: record.fields.AuthorAvatar || "sunrise",
        createdAt: record.fields.CreatedAt || null,
        body: record.fields.Body || "",
      }));

      res.status(200).json({ threads });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threads" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const { title, groupSlug, authorName, authorAvatar, body } = req.body || {};
      if (!title || !groupSlug) {
        res.status(400).json({ error: "Title and group are required" });
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
                Title: title,
                GroupSlug: groupSlug,
                AuthorName: authorName || "Member",
                AuthorAvatar: authorAvatar || "sunrise",
                Body: body || "",
                CreatedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create thread" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create thread" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
