import { useState, useRef, useEffect } from "react";

// Format date for Google Calendar URL (YYYYMMDDTHHmmssZ)
function formatGoogleDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Format date for Outlook URL (YYYY-MM-DDTHH:mm:ss)
function formatOutlookDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().replace(/\.\d{3}Z$/, "");
}

export default function AddToCalendarDropdown({ event }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { title, start, end, description, location, link } = event;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Build description with meeting link
  const fullDescription = link
    ? `${description || ""}${description ? "\n\n" : ""}Join: ${link}`
    : description || "";

  // Google Calendar URL
  const googleUrl = (() => {
    const params = new URLSearchParams();
    params.set("action", "TEMPLATE");
    params.set("text", title || "Event");
    params.set("dates", `${formatGoogleDate(start)}/${formatGoogleDate(end || start)}`);
    if (fullDescription) params.set("details", fullDescription);
    if (location) params.set("location", location);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  // Outlook URL
  const outlookUrl = (() => {
    const params = new URLSearchParams();
    params.set("path", "/calendar/action/compose");
    params.set("rru", "addevent");
    params.set("subject", title || "Event");
    params.set("startdt", formatOutlookDate(start));
    params.set("enddt", formatOutlookDate(end || start));
    if (fullDescription) params.set("body", fullDescription);
    if (location) params.set("location", location);
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  })();

  // .ics download URL
  const icsUrl = (() => {
    const params = new URLSearchParams();
    params.set("title", title || "Event");
    params.set("start", start);
    if (end) params.set("end", end);
    if (description) params.set("description", description);
    if (location) params.set("location", location);
    if (link) params.set("link", link);
    return `/api/calendar/generate?${params.toString()}`;
  })();

  return (
    <div className="calendar-dropdown" ref={dropdownRef}>
      <button
        className="event-btn calendar-dropdown-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Add to Calendar
        <svg
          className={`dropdown-arrow ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="calendar-dropdown-menu">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="calendar-dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Google Calendar
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="calendar-dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Outlook
          </a>
          <a
            href={icsUrl}
            download
            className="calendar-dropdown-item"
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download .ics
          </a>
        </div>
      )}
    </div>
  );
}
