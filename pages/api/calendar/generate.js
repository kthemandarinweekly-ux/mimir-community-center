// Generates .ics calendar file for download
// Accepts query params: title, start, end, description, location, link

function formatICSDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function generateUID() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@mimir.community`;
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { title, start, end, description, location, link } = req.query;

  if (!title || !start) {
    res.status(400).json({ error: "Missing required parameters: title, start" });
    return;
  }

  const startDate = formatICSDate(start);
  const endDate = formatICSDate(end) || formatICSDate(new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString());

  if (!startDate) {
    res.status(400).json({ error: "Invalid start date" });
    return;
  }

  // Build description with meeting link if provided
  let fullDescription = description || "";
  if (link) {
    fullDescription = fullDescription ? `${fullDescription}\\n\\nJoin: ${link}` : `Join: ${link}`;
  }

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mimir Language Community//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${generateUID()}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeICS(title)}`,
    fullDescription ? `DESCRIPTION:${escapeICS(fullDescription)}` : null,
    location ? `LOCATION:${escapeICS(location)}` : null,
    link ? `URL:${escapeICS(link)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  // Generate safe filename
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
  const filename = `${safeTitle}.ics`;

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(icsContent);
}
