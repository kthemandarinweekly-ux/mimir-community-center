export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_MATERIALS_TABLE_NAME || "Materials";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch materials by group
  if (req.method === "GET") {
    const { groupSlug, type } = req.query;

    try {
      // Only filter by type on Airtable side (single select works fine)
      // For groupSlug (multi-select), we filter in JavaScript after fetching
      let filter = "";
      if (type) {
        filter = `&filterByFormula=${encodeURIComponent(`{Type}='${type}'`)}`;
      }

      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=UploadedAt&sort%5B0%5D%5Bdirection%5D=desc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch materials" });
        return;
      }

      const data = await response.json();
      let materials = (data.records || []).map((record) => ({
        id: record.id,
        title: record.fields.Title || "Untitled",
        description: record.fields.Description || "",
        type: record.fields.Type || "document",
        fileUrl: record.fields.FileUrl || "",
        groupSlug: record.fields.GroupSlug || [],
        uploadedAt: record.fields.UploadedAt || null,
      }));

      // Filter by groupSlug in JavaScript (handles multi-select arrays properly)
      if (groupSlug) {
        materials = materials.filter((m) =>
          Array.isArray(m.groupSlug)
            ? m.groupSlug.includes(groupSlug)
            : m.groupSlug === groupSlug
        );
      }

      res.status(200).json({ materials });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch materials" });
    }
    return;
  }

  // POST - Upload/create a material entry (admin only)
  if (req.method === "POST") {
    try {
      const { title, description, type, fileUrl, groupSlug } = req.body || {};
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
                Description: description || "",
                Type: type || "document",
                FileUrl: fileUrl || "",
                GroupSlug: groupSlug || "",
                UploadedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create material" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create material" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
