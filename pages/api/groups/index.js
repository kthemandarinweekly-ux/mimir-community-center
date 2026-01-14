export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_GROUPS_TABLE_NAME || "Groups";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch all groups or single group by slug
  if (req.method === "GET") {
    const { slug } = req.query;

    try {
      let url = baseUrl;
      if (slug) {
        const filter = `filterByFormula=${encodeURIComponent(`{Slug}='${slug}'`)}`;
        url = `${baseUrl}?${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch groups" });
        return;
      }

      const data = await response.json();
      const groups = (data.records || []).map((record) => ({
        id: record.id,
        name: record.fields.Name || "Unnamed Group",
        slug: record.fields.Slug || "",
        language: record.fields.Language || "",
        level: record.fields.Level || "Intermediate",
        description: record.fields.Description || "",
        focus: record.fields.Focus ? record.fields.Focus.split(",").map((s) => s.trim()) : [],
        nextEvent: record.fields.NextEvent || "",
        memberCount: record.fields.MemberCount || 0,
        onlineCount: record.fields.OnlineCount || 0,
        adminCount: record.fields.AdminCount || 0,
      }));

      if (slug) {
        if (groups.length === 0) {
          res.status(404).json({ error: "Group not found" });
          return;
        }
        res.status(200).json({ group: groups[0] });
        return;
      }

      res.status(200).json({ groups });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
    return;
  }

  // POST - Create a new group (admin only)
  if (req.method === "POST") {
    try {
      const { name, slug, language, level, description, focus, nextEvent } = req.body || {};
      if (!name || !slug) {
        res.status(400).json({ error: "Name and slug are required" });
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
                Name: name,
                Slug: slug,
                Language: language || "",
                Level: level || "Intermediate",
                Description: description || "",
                Focus: Array.isArray(focus) ? focus.join(", ") : focus || "",
                NextEvent: nextEvent || "",
                MemberCount: 0,
                OnlineCount: 0,
                AdminCount: 1,
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create group" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create group" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
