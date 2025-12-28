export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_MEMBERS_TABLE_NAME;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !tableName || !apiKey) {
    res.status(200).json({ members: [] });
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ members: [] });
      return;
    }

    const data = await response.json();
    const members = (data.records || []).map((record) => ({
      id: record.id,
      name: record.fields.Name || "Member",
      email: record.fields.Email || "",
      group: record.fields.Group || "",
    }));

    res.status(200).json({ members });
  } catch (error) {
    res.status(200).json({ members: [] });
  }
}
