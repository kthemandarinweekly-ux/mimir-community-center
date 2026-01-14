export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_MEMBERSHIPS_TABLE_NAME || "Memberships";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch memberships by user email or group slug
  if (req.method === "GET") {
    const { email, groupSlug } = req.query;

    try {
      let filter = "";
      if (email && groupSlug) {
        filter = `filterByFormula=AND({UserEmail}='${email}',{GroupSlug}='${groupSlug}')`;
      } else if (email) {
        filter = `filterByFormula=${encodeURIComponent(`{UserEmail}='${email}'`)}`;
      } else if (groupSlug) {
        filter = `filterByFormula=${encodeURIComponent(`{GroupSlug}='${groupSlug}'`)}`;
      }

      const url = filter ? `${baseUrl}?${filter}` : baseUrl;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch memberships" });
        return;
      }

      const data = await response.json();
      const memberships = (data.records || []).map((record) => ({
        id: record.id,
        userEmail: record.fields.UserEmail || "",
        userName: record.fields.UserName || "",
        userAvatar: record.fields.UserAvatar || "sunrise",
        groupSlug: record.fields.GroupSlug || "",
        groupName: record.fields.GroupName || "",
        role: record.fields.Role || "member",
        joinedAt: record.fields.JoinedAt || null,
      }));

      res.status(200).json({ memberships });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memberships" });
    }
    return;
  }

  // POST - Join a group
  if (req.method === "POST") {
    try {
      const { userEmail, userName, userAvatar, groupSlug, groupName } = req.body || {};
      if (!userEmail || !groupSlug) {
        res.status(400).json({ error: "User email and group slug are required" });
        return;
      }

      // Check if already a member
      const checkFilter = `filterByFormula=AND({UserEmail}='${userEmail}',{GroupSlug}='${groupSlug}')`;
      const checkResponse = await fetch(`${baseUrl}?${checkFilter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.records?.length > 0) {
          res.status(409).json({ error: "Already a member of this group" });
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
                UserEmail: userEmail,
                UserName: userName || "",
                UserAvatar: userAvatar || "sunrise",
                GroupSlug: groupSlug,
                GroupName: groupName || "",
                Role: "member",
                JoinedAt: new Date().toISOString(),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to join group" });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to join group" });
    }
    return;
  }

  // DELETE - Leave a group
  if (req.method === "DELETE") {
    try {
      const { userEmail, groupSlug } = req.body || {};
      if (!userEmail || !groupSlug) {
        res.status(400).json({ error: "User email and group slug are required" });
        return;
      }

      // Find the membership
      const filter = `filterByFormula=AND({UserEmail}='${userEmail}',{GroupSlug}='${groupSlug}')`;
      const findResponse = await fetch(`${baseUrl}?${filter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!findResponse.ok) {
        res.status(findResponse.status).json({ error: "Failed to find membership" });
        return;
      }

      const findData = await findResponse.json();
      const record = findData.records?.[0];

      if (!record) {
        res.status(404).json({ error: "Membership not found" });
        return;
      }

      // Delete the membership
      const deleteResponse = await fetch(`${baseUrl}/${record.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!deleteResponse.ok) {
        res.status(deleteResponse.status).json({ error: "Failed to leave group" });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave group" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
