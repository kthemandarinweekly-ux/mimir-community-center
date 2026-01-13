import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import MinimalNav from "../components/MinimalNav";

const EVENT_TYPES = ["Class", "Debate Prep", "Competition"];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function buildCalendarGrid(currentDate) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const startWeekday = start.getDay();
  const totalDays = end.getDate();
  const days = [];

  for (let i = 0; i < startWeekday; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  return days;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = status === "authenticated";

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to load events");
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError("Unable to load calendar events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (!session?.user?.email) {
      setRsvps([]);
      return;
    }

    const fetchRsvps = async () => {
      try {
        const response = await fetch(`/api/rsvps?email=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setRsvps(data.rsvps || []);
        }
      } catch (error) {
        console.error("Failed to fetch RSVPs:", error);
      }
    };

    fetchRsvps();
  }, [session?.user?.email]);

  const hasRsvp = (eventId) => {
    return rsvps.some((rsvp) => rsvp.eventId === eventId);
  };

  const getRsvpStatus = (eventId) => {
    const rsvp = rsvps.find((r) => r.eventId === eventId);
    return rsvp?.status || null;
  };

  const getRsvpRecord = (eventId) => {
    return rsvps.find((r) => r.eventId === eventId) || null;
  };

  const handleRsvp = async (event, newStatus = "going") => {
    if (!session?.user?.email) return;

    setRsvpLoading(true);
    try {
      const currentStatus = getRsvpStatus(event.id);

      if (currentStatus === newStatus) {
        await fetch("/api/rsvps", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            userEmail: session.user.email,
          }),
        });
      } else {
        await fetch("/api/rsvps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            eventTitle: event.title,
            eventStart: event.start,
            eventEnd: event.end,
            eventDescription: event.description,
            eventLocation: event.location,
            eventLink: event.link,
            userEmail: session.user.email,
            userName: session.user.name || "",
            status: newStatus,
          }),
        });
      }

      const response = await fetch(`/api/rsvps?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setRsvps(data.rsvps || []);
      }
    } catch (error) {
      console.error("Failed to update RSVP:", error);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleReminder = async (event) => {
    if (!session?.user?.email) return;

    setRsvpLoading(true);
    try {
      await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventStart: event.start,
          eventEnd: event.end,
          eventDescription: event.description,
          eventLocation: event.location,
          eventLink: event.link,
          userEmail: session.user.email,
          userName: session.user.name || "",
          status: getRsvpStatus(event.id) || "saved",
          reminderRequested: true,
        }),
      });

      const response = await fetch(`/api/rsvps?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setRsvps(data.rsvps || []);
      }
    } catch (error) {
      console.error("Failed to set reminder:", error);
    } finally {
      setRsvpLoading(false);
    }
  };

  const days = useMemo(() => buildCalendarGrid(currentDate), [currentDate]);
  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      if (!event.start) {
        return;
      }
      const dateKey = new Date(event.start).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(event);
    });
    return map;
  }, [events]);

  const thisMonthEvents = events.filter((event) => {
    if (!event.start) return false;
    const eventDate = new Date(event.start);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const userRsvpCount = rsvps.filter((rsvp) => {
    const event = events.find((e) => e.id === rsvp.eventId);
    if (!event?.start) return false;
    const eventDate = new Date(event.start);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  const formatTime = (value) => {
    if (!value) {
      return "TBD";
    }
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (value) => {
    if (!value) {
      return "TBD";
    }
    return new Date(value).toLocaleDateString();
  };

  return (
    <>
      <Head>
        <title>Calendar | Open Debate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="minimal-page">
        <MinimalNav />

        <main className="minimal-content">
          <section className="minimal-hero">
            <p className="minimal-label">Schedule</p>
            <h1 className="minimal-title">Community Calendar</h1>
            <p className="minimal-subtitle">
              Free live sessions, discussions, and events. Save events to get reminders.
            </p>
          </section>

          <section className="minimal-section">
            <div className="calendar-wrapper">
              <div className="calendar-controls">
                <button
                  className="calendar-nav-btn"
                  type="button"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                    )
                  }
                >
                  Previous
                </button>
                <div className="calendar-month-label">
                  <h2>{monthLabel}</h2>
                  <p>{thisMonthEvents.length} events this month</p>
                </div>
                <button
                  className="calendar-nav-btn"
                  type="button"
                  onClick={() =>
                    setCurrentDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                    )
                  }
                >
                  Next
                </button>
              </div>

              <div className="calendar-legend">
                <span className="legend-item">
                  <span className="legend-dot lang-chinese"></span>
                  Chinese
                </span>
                <span className="legend-item">
                  <span className="legend-dot lang-spanish"></span>
                  Spanish
                </span>
                <span className="legend-item">
                  <span className="legend-dot lang-english"></span>
                  English
                </span>
              </div>

              {error && <p className="calendar-message">{error}</p>}
              {loading && <p className="calendar-message">Loading events...</p>}

              <div className="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="calendar-day empty" />;
                  }
                  const dayKey = day.toDateString();
                  const dayEvents = eventsByDate.get(dayKey) || [];
                  const hasEvents = dayEvents.length > 0;
                  return (
                    <div key={dayKey} className={`calendar-day ${hasEvents ? "has-events" : ""}`}>
                      <span className="calendar-date-num">{day.getDate()}</span>
                      <div className="calendar-day-events">
                        {dayEvents.slice(0, 2).map((event) => {
                          const isRsvped = hasRsvp(event.id);
                          const langClass = event.language ? `lang-${event.language.toLowerCase()}` : "";
                          return (
                            <button
                              key={event.id}
                              type="button"
                              className={`calendar-event-btn ${isRsvped ? "saved" : ""} ${langClass}`}
                              onClick={() => setSelectedEvent(event)}
                              title={event.title}
                            >
                              {event.language && (
                                <span className={`event-lang-dot ${langClass}`}></span>
                              )}
                              {isRsvped && "✓ "}
                              {event.title}
                            </button>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="calendar-more">+{dayEvents.length - 2}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>

      {selectedEvent && (
        <div className="event-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="event-close"
              type="button"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>
            <div className="event-modal-header">
              <p className="minimal-label">{selectedEvent.type}</p>
              {selectedEvent.language && (
                <span className={`event-language-badge lang-${selectedEvent.language.toLowerCase()}`}>
                  {selectedEvent.language}
                </span>
              )}
            </div>
            <h2>{selectedEvent.title}</h2>
            <p className="event-description">{selectedEvent.description || "Event details."}</p>
            <div className="event-details">
              <div>
                <span className="event-detail-label">Date</span>
                <span>{formatDate(selectedEvent.start)}</span>
              </div>
              <div>
                <span className="event-detail-label">Time</span>
                <span>{formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}</span>
              </div>
              <div>
                <span className="event-detail-label">Location</span>
                <span>{selectedEvent.location || "Online"}</span>
              </div>
            </div>
            {selectedEvent.link && (
              <a
                className="event-zoom-btn"
                href={selectedEvent.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Zoom Meeting
              </a>
            )}
            <div className="event-actions">
              {isLoggedIn ? (
                <>
                  <button
                    className="event-btn primary"
                    type="button"
                    onClick={() => handleRsvp(selectedEvent, "saved")}
                    disabled={rsvpLoading}
                  >
                    {getRsvpStatus(selectedEvent.id) ? "Saved ✓" : "Save event"}
                  </button>
                  <button
                    className="event-btn"
                    type="button"
                    onClick={() => handleReminder(selectedEvent)}
                    disabled={rsvpLoading || getRsvpRecord(selectedEvent.id)?.reminderRequested}
                  >
                    {getRsvpRecord(selectedEvent.id)?.reminderRequested
                      ? "Reminder set"
                      : "Email reminder"}
                  </button>
                </>
              ) : (
                <Link className="event-btn primary" href="/signin">
                  Sign in to save
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
