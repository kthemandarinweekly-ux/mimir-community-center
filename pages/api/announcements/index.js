export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_ANNOUNCEMENTS_TABLE_NAME || "Announcements";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch all announcements
  if (req.method === "GET") {
    const { groupSlug, limit } = req.query;

    try {
      let filter = "";
      if (groupSlug) {
        filter = `&filterByFormula=OR({GroupSlug}='${groupSlug}',{GroupSlug}='')`;
      }
      const maxRecords = limit ? `&maxRecords=${limit}` : "";

      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=PublishedAt&sort%5B0%5D%5Bdirection%5D=desc${filter}${maxRecords}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch announcements" });
        return;
      }

      const data = await response.json();
      const announcements = (data.records || []).map((record) => ({
        id: record.id,
        title: record.fields.Title || "Untitled",
        body: record.fields.Body || "",
        type: record.fields.Type || "general",
        groupSlug: record.fields.GroupSlug || "",
        actionLabel: record.fields.ActionLabel || "",
        actionLink: record.fields.ActionLink || "",
        publishedAt: record.fields.PublishedAt || null,
      }));

      res.status(200).json({ announcements });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
    return;
  }

  // POST - Create an announcement (admin only)
  if (req.method === "POST") {
    try {
      const { title, body, type, groupSlug, actionLabel, actionLink } = req.body || {};
      if (!title) {
        res.status(400).json({ error: "Title is required" });
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
                Body: body || "",
                Type: type || "general",
                GroupSlug: groupSlug || "",
                ActionLabel: actionLabel || "",
                ActionLink: actionLink || "",
                PublishedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create announcement" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create announcement" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
