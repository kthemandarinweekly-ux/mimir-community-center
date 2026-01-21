const buildEmailHtml = ({ title, start, end, description, location, link }) => {
  const startText = start ? new Date(start).toLocaleString() : "TBD";
  const endText = end ? new Date(end).toLocaleString() : "TBD";
  const safeDescription = description || "Event details.";
  const safeLocation = location || "Online";
  const linkBlock = link
    ? `<p><strong>Join link:</strong> <a href="${link}">${link}</a></p>`
    : "";

  return `
    <div>
      <h2>${title}</h2>
      <p><strong>Start:</strong> ${startText}</p>
      <p><strong>End:</strong> ${endText}</p>
      <p><strong>Location:</strong> ${safeLocation}</p>
      ${linkBlock}
      <p>${safeDescription}</p>
    </div>
  `;
};

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Optional: verify cron secret for security
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.query.secret !== cronSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_RSVPS_TABLE_NAME || "RSVPs";
  const apiKey = process.env.AIRTABLE_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;

  if (!baseId || !apiKey || !resendApiKey || !resendFrom) {
    res.status(500).json({ error: "Missing configuration" });
    return;
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const formula =
    "AND({ReminderRequested}=1,{ReminderSentAt}=BLANK(),{EventStart}>=NOW(),{EventStart}<=DATEADD(NOW(),1,'hours'))";
  const filter = `filterByFormula=${encodeURIComponent(formula)}`;

  try {
    const response = await fetch(`${baseUrl}?${filter}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to load reminders" });
      return;
    }

    const data = await response.json();
    const records = data.records || [];

    for (const record of records) {
      const fields = record.fields || {};
      const email = fields.UserEmail;
      const title = fields.EventTitle || "Upcoming event";

      if (!email) {
        continue;
      }

      const html = buildEmailHtml({
        title,
        start: fields.EventStart,
        end: fields.EventEnd,
        description: fields.EventDescription,
        location: fields.EventLocation,
        link: fields.EventLink,
      });

      const sendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: email,
          subject: `Reminder: ${title} starts in 1 hour`,
          html,
        }),
      });

      if (!sendResponse.ok) {
        continue;
      }

      await fetch(`${baseUrl}/${record.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            ReminderSentAt: new Date().toISOString(),
          },
        }),
      });
    }

    res.status(200).json({ success: true, sent: records.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reminders" });
  }
}
