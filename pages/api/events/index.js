export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !tableName || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  if (req.method === "GET") {
    try {
      const response = await fetch(
        `${url}?sort%5B0%5D%5Bfield%5D=Start&sort%5B0%5D%5Bdirection%5D=asc`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch events" });
        return;
      }

      const data = await response.json();
      const events = (data.records || []).map((record) => ({
        id: record.id,
        title: record.fields.Title || "Untitled",
        type: record.fields.Type || "Class",
        language: record.fields.Language || "",
        start: record.fields.Start || null,
        end: record.fields.End || null,
        description: record.fields.Description || "",
        location: record.fields.Location || "",
        link: record.fields.Link || "",
      }));

      res.status(200).json({ events });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const { title, type, start, end, description, location, link } = req.body || {};
      const response = await fetch(url, {
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
                Type: type,
                Start: start,
                End: end || undefined,
                Description: description || "",
                Location: location || "",
                Link: link || "",
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create event" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
