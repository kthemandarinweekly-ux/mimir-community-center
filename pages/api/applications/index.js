export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_APPLICATIONS_TABLE_NAME || "Applications";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch applications by user or competition
  if (req.method === "GET") {
    const { email, competitionSlug, competitionId } = req.query;

    try {
      let filterParts = [];
      if (email) {
        filterParts.push(`{UserEmail}='${email}'`);
      }
      if (competitionSlug) {
        filterParts.push(`{CompetitionSlug}='${competitionSlug}'`);
      }
      if (competitionId) {
        filterParts.push(`{CompetitionId}='${competitionId}'`);
      }

      let filter = "";
      if (filterParts.length > 0) {
        const formula = filterParts.length > 1 ? `AND(${filterParts.join(",")})` : filterParts[0];
        filter = `&filterByFormula=${encodeURIComponent(formula)}`;
      }

      const response = await fetch(
        `${baseUrl}?sort%5B0%5D%5Bfield%5D=AppliedAt&sort%5B0%5D%5Bdirection%5D=desc${filter}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch applications" });
        return;
      }

      const data = await response.json();
      const applications = (data.records || []).map((record) => ({
        id: record.id,
        competitionId: record.fields.CompetitionId || "",
        competitionSlug: record.fields.CompetitionSlug || "",
        competitionName: record.fields.CompetitionName || "",
        userEmail: record.fields.UserEmail || "",
        userName: record.fields.UserName || "",
        teamName: record.fields.TeamName || "",
        partnerEmail: record.fields.PartnerEmail || "",
        status: record.fields.Status || "pending",
        appliedAt: record.fields.AppliedAt || null,
      }));

      res.status(200).json({ applications });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
    return;
  }

  // POST - Submit an application
  if (req.method === "POST") {
    try {
      const {
        competitionId,
        competitionSlug,
        competitionName,
        userEmail,
        userName,
        teamName,
        partnerEmail,
      } = req.body || {};

      if (!competitionSlug || !userEmail) {
        res.status(400).json({ error: "Competition and user email are required" });
        return;
      }

      // Check if already applied
      const checkFilter = `filterByFormula=AND({CompetitionSlug}='${competitionSlug}',{UserEmail}='${userEmail}')`;
      const checkResponse = await fetch(`${baseUrl}?${checkFilter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.records?.length > 0) {
          res.status(409).json({ error: "Already applied to this competition" });
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
                CompetitionId: competitionId || "",
                CompetitionSlug: competitionSlug,
                CompetitionName: competitionName || "",
                UserEmail: userEmail,
                UserName: userName || "",
                TeamName: teamName || "",
                PartnerEmail: partnerEmail || "",
                Status: "pending",
                AppliedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to submit application" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
    return;
  }

  // PATCH - Update application status (admin only)
  if (req.method === "PATCH") {
    try {
      const { id, status } = req.body || {};
      if (!id || !status) {
        res.status(400).json({ error: "Application ID and status are required" });
        return;
      }

      const response = await fetch(`${baseUrl}/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Status: status,
          },
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to update application" });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update application" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
