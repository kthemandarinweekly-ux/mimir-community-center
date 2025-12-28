export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const { id } = req.query;

  if (!baseId || !tableName || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  if (!id) {
    res.status(400).json({ error: "Missing event id" });
    return;
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${id}`;

  if (req.method === "PATCH") {
    try {
      const { title, type, start, end, description, location, link } = req.body || {};
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Title: title,
            Type: type,
            Start: start,
            End: end || undefined,
            Description: description || "",
            Location: location || "",
            Link: link || "",
          },
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to update event" });
        return;
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
