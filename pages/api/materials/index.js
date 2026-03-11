import { getCurrentSeason } from "../../../data/seasons";

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
    const { groupSlug, type, seasonId, includeArchived, archivedOnly } = req.query;
    const activeSeasonId = getCurrentSeason().id;
    const targetSeasonId = seasonId || activeSeasonId;
    const shouldIncludeArchived = includeArchived === "true";
    const shouldShowArchivedOnly = archivedOnly === "true";

    try {
      const formulaParts = [];
      if (type) {
        formulaParts.push(`{Type}='${type}'`);
      }

      if (targetSeasonId) {
        formulaParts.push(`{SeasonId}='${targetSeasonId}'`);
      }

      if (shouldShowArchivedOnly) {
        formulaParts.push("{IsArchived}=1");
      } else if (!shouldIncludeArchived) {
        formulaParts.push("OR({IsArchived}=0,{IsArchived}=BLANK())");
      }

      const formula = formulaParts.length > 0
        ? formulaParts.length === 1
          ? formulaParts[0]
          : `AND(${formulaParts.join(",")})`
        : "";

      const buildQueryUrl = (filterFormula) => {
        const filter = filterFormula
          ? `&filterByFormula=${encodeURIComponent(filterFormula)}`
          : "";
        return `${baseUrl}?sort%5B0%5D%5Bfield%5D=UploadedAt&sort%5B0%5D%5Bdirection%5D=desc${filter}`;
      };

      let response = await fetch(
        buildQueryUrl(formula),
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      // Backward-compatible fallback while Airtable fields are being added.
      if (!response.ok && (targetSeasonId || shouldIncludeArchived || shouldShowArchivedOnly)) {
        const fallbackFormula = type ? `{Type}='${type}'` : "";
        response = await fetch(buildQueryUrl(fallbackFormula), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
      }

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
        seasonId: record.fields.SeasonId || "",
        isArchived: record.fields.IsArchived === true,
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
      const { title, description, type, fileUrl, groupSlug, seasonId, isArchived } = req.body || {};
      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const fields = {
        Title: title,
        Description: description || "",
        Type: type || "document",
        FileUrl: fileUrl || "",
        GroupSlug: groupSlug || "",
        SeasonId: seasonId || getCurrentSeason().id,
        IsArchived: isArchived === true,
        UploadedAt: new Date().toISOString(),
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
        // Backward-compatible fallback for Airtable bases without SeasonId/IsArchived.
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

        if (!fallbackResponse.ok) {
          res.status(fallbackResponse.status).json({ error: "Failed to create material" });
          return;
        }

        const fallbackData = await fallbackResponse.json();
        res.status(201).json({ id: fallbackData.records?.[0]?.id });
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
