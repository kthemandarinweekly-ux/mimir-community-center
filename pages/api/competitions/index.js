export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_COMPETITIONS_TABLE_NAME || "Competitions";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch all competitions or single by slug
  if (req.method === "GET") {
    const { slug, status } = req.query;

    try {
      let filterParts = [];
      if (slug) {
        filterParts.push(`{Slug}='${slug}'`);
      }
      if (status) {
        filterParts.push(`{Status}='${status}'`);
      }

      let filter = "";
      if (filterParts.length > 0) {
        const formula = filterParts.length > 1 ? `AND(${filterParts.join(",")})` : filterParts[0];
        filter = `&filterByFormula=${encodeURIComponent(formula)}`;
      }

      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=StartDate&sort%5B0%5D%5Bdirection%5D=asc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch competitions" });
        return;
      }

      const data = await response.json();
      const competitions = (data.records || []).map((record) => ({
        id: record.id,
        name: record.fields.Name || "Untitled Competition",
        slug: record.fields.Slug || "",
        season: record.fields.Season || "",
        theme: record.fields.Theme || "",
        description: record.fields.Description || "",
        status: record.fields.Status || "upcoming",
        round: record.fields.Round || "",
        format: record.fields.Format || "online",
        startDate: record.fields.StartDate || null,
        endDate: record.fields.EndDate || null,
        applicationDeadline: record.fields.ApplicationDeadline || null,
        maxParticipants: record.fields.MaxParticipants || 0,
        currentParticipants: record.fields.CurrentParticipants || 0,
      }));

      if (slug) {
        if (competitions.length === 0) {
          res.status(404).json({ error: "Competition not found" });
          return;
        }
        res.status(200).json({ competition: competitions[0] });
        return;
      }

      res.status(200).json({ competitions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch competitions" });
    }
    return;
  }

  // POST - Create a competition (admin only)
  if (req.method === "POST") {
    try {
      const {
        name,
        slug,
        season,
        theme,
        description,
        status,
        round,
        format,
        startDate,
        endDate,
        applicationDeadline,
        maxParticipants,
      } = req.body || {};

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
                Season: season || "",
                Theme: theme || "",
                Description: description || "",
                Status: status || "upcoming",
                Round: round || "",
                Format: format || "online",
                StartDate: startDate || null,
                EndDate: endDate || null,
                ApplicationDeadline: applicationDeadline || null,
                MaxParticipants: maxParticipants || 0,
                CurrentParticipants: 0,
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create competition" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create competition" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
