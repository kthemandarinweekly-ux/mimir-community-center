export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_PREFERENCES_TABLE_NAME || "Preferences";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch user preferences
  if (req.method === "GET") {
    const { email } = req.query;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    try {
      const filter = `filterByFormula=${encodeURIComponent(`{UserEmail}='${email}'`)}`;
      const response = await fetch(`${baseUrl}?${filter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch preferences" });
        return;
      }

      const data = await response.json();
      const record = data.records?.[0];

      if (!record) {
        // Return defaults if no preferences set
        res.status(200).json({
          preferences: {
            emailDigests: true,
            mobileAlerts: false,
            competitionReminders: true,
          },
        });
        return;
      }

      res.status(200).json({
        preferences: {
          id: record.id,
          emailDigests: record.fields.EmailDigests !== false,
          mobileAlerts: record.fields.MobileAlerts === true,
          competitionReminders: record.fields.CompetitionReminders !== false,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
    return;
  }

  // POST - Create or update preferences
  if (req.method === "POST") {
    try {
      const { email, emailDigests, mobileAlerts, competitionReminders } = req.body || {};
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      // Check if preferences exist
      const checkFilter = `filterByFormula=${encodeURIComponent(`{UserEmail}='${email}'`)}`;
      const checkResponse = await fetch(`${baseUrl}?${checkFilter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const existingRecord = checkData.records?.[0];

        if (existingRecord) {
          // Update existing preferences
          const updateResponse = await fetch(`${baseUrl}/${existingRecord.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                EmailDigests: emailDigests !== undefined ? emailDigests : existingRecord.fields.EmailDigests,
                MobileAlerts: mobileAlerts !== undefined ? mobileAlerts : existingRecord.fields.MobileAlerts,
                CompetitionReminders:
                  competitionReminders !== undefined
                    ? competitionReminders
                    : existingRecord.fields.CompetitionReminders,
              },
            }),
          });

          if (!updateResponse.ok) {
            res.status(updateResponse.status).json({ error: "Failed to update preferences" });
            return;
          }

          res.status(200).json({ success: true, updated: true });
          return;
        }
      }

      // Create new preferences
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
                UserEmail: email,
                EmailDigests: emailDigests !== undefined ? emailDigests : true,
                MobileAlerts: mobileAlerts !== undefined ? mobileAlerts : false,
                CompetitionReminders: competitionReminders !== undefined ? competitionReminders : true,
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to create preferences" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create/update preferences" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
