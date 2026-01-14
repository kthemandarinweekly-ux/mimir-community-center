export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_USERS_TABLE_NAME || "Users";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch user by email
  if (req.method === "GET") {
    const { email } = req.query;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    try {
      const filter = `filterByFormula=${encodeURIComponent(`{Email}='${email}'`)}`;
      const response = await fetch(`${baseUrl}?${filter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch user" });
        return;
      }

      const data = await response.json();
      const record = data.records?.[0];

      if (!record) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        user: {
          id: record.id,
          email: record.fields.Email || "",
          name: record.fields.Name || "",
          nickname: record.fields.Nickname || "",
          avatar: record.fields.Avatar || "sunrise",
          createdAt: record.fields.CreatedAt || null,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
    return;
  }

  // POST - Create or update user
  if (req.method === "POST") {
    try {
      const { email, name, nickname, avatar } = req.body || {};
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      // Check if user exists
      const filter = `filterByFormula=${encodeURIComponent(`{Email}='${email}'`)}`;
      const existingResponse = await fetch(`${baseUrl}?${filter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!existingResponse.ok) {
        res.status(existingResponse.status).json({ error: "Failed to check existing user" });
        return;
      }

      const existingData = await existingResponse.json();
      const existingRecord = existingData.records?.[0];

      if (existingRecord) {
        // Update existing user
        const updateResponse = await fetch(`${baseUrl}/${existingRecord.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              Name: name || existingRecord.fields.Name || "",
              Nickname: nickname !== undefined ? nickname : existingRecord.fields.Nickname || "",
              Avatar: avatar || existingRecord.fields.Avatar || "sunrise",
            },
          }),
        });

        if (!updateResponse.ok) {
          res.status(updateResponse.status).json({ error: "Failed to update user" });
          return;
        }

        const updatedData = await updateResponse.json();
        res.status(200).json({
          user: {
            id: updatedData.id,
            email: updatedData.fields.Email,
            name: updatedData.fields.Name || "",
            nickname: updatedData.fields.Nickname || "",
            avatar: updatedData.fields.Avatar || "sunrise",
            createdAt: updatedData.fields.CreatedAt,
          },
        });
        return;
      }

      // Create new user
      const createResponse = await fetch(baseUrl, {
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
                Name: name || "",
                Nickname: nickname || "",
                Avatar: avatar || "sunrise",
                CreatedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!createResponse.ok) {
        res.status(createResponse.status).json({ error: "Failed to create user" });
        return;
      }

      const createdData = await createResponse.json();
      const newRecord = createdData.records?.[0];
      res.status(201).json({
        user: {
          id: newRecord.id,
          email: newRecord.fields.Email,
          name: newRecord.fields.Name || "",
          nickname: newRecord.fields.Nickname || "",
          avatar: newRecord.fields.Avatar || "sunrise",
          createdAt: newRecord.fields.CreatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create/update user" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
