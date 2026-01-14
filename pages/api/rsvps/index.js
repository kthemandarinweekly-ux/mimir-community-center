export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_RSVPS_TABLE_NAME || "RSVPs";
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    res.status(500).json({ error: "Missing Airtable configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  // GET - Fetch RSVPs by event or user
  if (req.method === "GET") {
    const { eventId, email } = req.query;

    try {
      let filter = "";
      if (eventId && email) {
        filter = `filterByFormula=AND({EventId}='${eventId}',{UserEmail}='${email}')`;
      } else if (eventId) {
        filter = `filterByFormula=${encodeURIComponent(`{EventId}='${eventId}'`)}`;
      } else if (email) {
        filter = `filterByFormula=${encodeURIComponent(`{UserEmail}='${email}'`)}`;
      }

      const url = filter ? `${baseUrl}?${filter}` : baseUrl;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch RSVPs" });
        return;
      }

      const data = await response.json();
      const rsvps = (data.records || []).map((record) => ({
        id: record.id,
        eventId: record.fields.EventId || "",
        eventTitle: record.fields.EventTitle || "",
        eventStart: record.fields.EventStart || null,
        eventEnd: record.fields.EventEnd || null,
        eventDescription: record.fields.EventDescription || "",
        eventLocation: record.fields.EventLocation || "",
        eventLink: record.fields.EventLink || "",
        userEmail: record.fields.UserEmail || "",
        userName: record.fields.UserName || "",
        status: record.fields.Status || "going",
        reminderRequested: record.fields.ReminderRequested || false,
        reminderSentAt: record.fields.ReminderSentAt || null,
        createdAt: record.fields.CreatedAt || null,
      }));

      res.status(200).json({ rsvps });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSVPs" });
    }
    return;
  }

  // POST - Create or update an RSVP
  if (req.method === "POST") {
    try {
      const {
        eventId,
        eventTitle,
        eventStart,
        eventEnd,
        eventDescription,
        eventLocation,
        eventLink,
        userEmail,
        userName,
        status,
        reminderRequested,
      } = req.body || {};
      if (!eventId || !userEmail) {
        res.status(400).json({ error: "Event ID and user email are required" });
        return;
      }

      // Check if RSVP exists
      const checkFilter = `filterByFormula=AND({EventId}='${eventId}',{UserEmail}='${userEmail}')`;
      const checkResponse = await fetch(`${baseUrl}?${checkFilter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const existingRecord = checkData.records?.[0];

        if (existingRecord) {
          const existingFields = existingRecord.fields || {};
          // Update existing RSVP
          const updateResponse = await fetch(`${baseUrl}/${existingRecord.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                Status: status || "going",
                EventTitle: eventTitle || existingFields.EventTitle || "",
                EventStart: eventStart || existingFields.EventStart || null,
                EventEnd: eventEnd || existingFields.EventEnd || null,
                EventDescription: eventDescription || existingFields.EventDescription || "",
                EventLocation: eventLocation || existingFields.EventLocation || "",
                EventLink: eventLink || existingFields.EventLink || "",
                ReminderRequested:
                  typeof reminderRequested === "boolean"
                    ? reminderRequested
                    : existingFields.ReminderRequested || false,
              },
            }),
          });

          if (!updateResponse.ok) {
            res.status(updateResponse.status).json({ error: "Failed to update RSVP" });
            return;
          }

          res.status(200).json({ id: existingRecord.id, updated: true });
          return;
        }
      }

      // Create new RSVP - only include fields that have values
      const fields = {
        EventId: eventId,
        UserEmail: userEmail,
      };

      // Only add optional fields if they have values
      if (eventTitle) fields.EventTitle = eventTitle;
      if (eventStart) fields.EventStart = eventStart;
      if (eventEnd) fields.EventEnd = eventEnd;
      if (eventDescription) fields.EventDescription = eventDescription;
      if (eventLocation) fields.EventLocation = eventLocation;
      if (eventLink) fields.EventLink = eventLink;
      if (userName) fields.UserName = userName;
      if (status) fields.Status = status;
      if (typeof reminderRequested === "boolean") fields.ReminderRequested = reminderRequested;
      // Note: Airtable automatically tracks creation time, so we don't need CreatedAt

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ fields }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Airtable create error:", errorData);
        res.status(response.status).json({
          error: "Failed to create RSVP",
          details: errorData.error?.message || JSON.stringify(errorData)
        });
        return;
      }

      const data = await response.json();
      res.status(201).json({ id: data.records?.[0]?.id });
    } catch (error) {
      console.error("RSVP creation error:", error);
      res.status(500).json({ error: "Failed to create/update RSVP", details: error.message });
    }
    return;
  }

  // DELETE - Remove an RSVP
  if (req.method === "DELETE") {
    try {
      const { eventId, userEmail } = req.body || {};
      if (!eventId || !userEmail) {
        res.status(400).json({ error: "Event ID and user email are required" });
        return;
      }

      // Find the RSVP
      const filter = `filterByFormula=AND({EventId}='${eventId}',{UserEmail}='${userEmail}')`;
      const findResponse = await fetch(`${baseUrl}?${filter}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!findResponse.ok) {
        res.status(findResponse.status).json({ error: "Failed to find RSVP" });
        return;
      }

      const findData = await findResponse.json();
      const record = findData.records?.[0];

      if (!record) {
        res.status(404).json({ error: "RSVP not found" });
        return;
      }

      const deleteResponse = await fetch(`${baseUrl}/${record.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!deleteResponse.ok) {
        res.status(deleteResponse.status).json({ error: "Failed to delete RSVP" });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete RSVP" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
