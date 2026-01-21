export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_SAVED_MATERIALS_TABLE_NAME || "SavedMaterials";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch saved materials for a user
  if (req.method === "GET") {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    try {
      const filter = `&filterByFormula=${encodeURIComponent(`{Email}='${email}'`)}`;
      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=SavedAt&sort%5B0%5D%5Bdirection%5D=desc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch saved materials" });
        return;
      }

      const data = await response.json();
      const savedMaterials = (data.records || []).map((record) => ({
        id: record.id,
        materialId: record.fields.MaterialId || "",
        materialTitle: record.fields.MaterialTitle || "Untitled",
        materialUrl: record.fields.MaterialUrl || "",
        materialType: record.fields.MaterialType || "",
        materialLanguage: record.fields.MaterialLanguage || "",
        savedAt: record.fields.SavedAt || null,
      }));

      res.status(200).json({ savedMaterials });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved materials" });
    }
    return;
  }

  // POST - Save a material
  if (req.method === "POST") {
    try {
      const { email, materialId, materialTitle, materialUrl, materialType, materialLanguage } = req.body || {};

      if (!email || !materialId) {
        res.status(400).json({ error: "Email and materialId are required" });
        return;
      }

      // Check if already saved
      const checkFilter = `&filterByFormula=${encodeURIComponent(`AND({Email}='${email}',{MaterialId}='${materialId}')`)}`;
      const checkResponse = await fetch(`${baseUrl}?${checkFilter}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.records && checkData.records.length > 0) {
          res.status(200).json({ message: "Already saved", id: checkData.records[0].id });
          return;
        }
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
                Email: email,
                MaterialId: materialId,
                MaterialTitle: materialTitle || "",
                MaterialUrl: materialUrl || "",
                MaterialType: materialType || "",
                MaterialLanguage: materialLanguage || "",
                SavedAt: new Date().toISOString().split("T")[0],
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        res.status(response.status).json({ error: "Failed to save material", details: errorData });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to save material" });
    }
    return;
  }

  // DELETE - Remove a saved material
  if (req.method === "DELETE") {
    try {
      const { email, materialId } = req.body || {};

      if (!email || !materialId) {
        res.status(400).json({ error: "Email and materialId are required" });
        return;
      }

      // Find the record to delete
      const filter = `&filterByFormula=${encodeURIComponent(`AND({Email}='${email}',{MaterialId}='${materialId}')`)}`;
      const findResponse = await fetch(`${baseUrl}?${filter}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!findResponse.ok) {
        res.status(findResponse.status).json({ error: "Failed to find saved material" });
        return;
      }

      const findData = await findResponse.json();
      if (!findData.records || findData.records.length === 0) {
        res.status(404).json({ error: "Saved material not found" });
        return;
      }

      const recordId = findData.records[0].id;
      const deleteResponse = await fetch(`${baseUrl}/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!deleteResponse.ok) {
        res.status(deleteResponse.status).json({ error: "Failed to delete saved material" });
        return;
      }

      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved material" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
