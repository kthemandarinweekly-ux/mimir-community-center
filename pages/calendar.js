import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import NavBar from "../components/NavBar";

// Calendar page - uses compact header with yellow accent

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

  // Fetch user's RSVPs
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
        // Remove RSVP
        await fetch("/api/rsvps", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            userEmail: session.user.email,
          }),
        });
      } else {
        // Create or update RSVP
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

      // Refresh RSVPs
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

  // Count events for this month
  const thisMonthEvents = events.filter((event) => {
    if (!event.start) return false;
    const eventDate = new Date(event.start);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Count user's RSVPs for this month
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
        <title>Mimir Community Center | Calendar</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact page-calendar">
        <NavBar />
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Calendar</span>
        </div>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Community schedule</p>
            <h1>Calendar of classes and debate prep</h1>
            <p className="lead">
              Stay ahead with a clear weekly rhythm. Admins post free sessions, topical
              discussions, and competition milestones.
            </p>
            <div className="hero-actions">
              {isLoggedIn ? (
                <Link className="cta" href="/account">
                  Your RSVPs ({userRsvpCount})
                </Link>
              ) : (
                <Link className="cta" href="/signin">
                  RSVP to sessions
                </Link>
              )}
              <Link className="cta ghost" href="/competitions">
                View competition timeline
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">This month</span>
              <h3>{monthLabel} rhythm</h3>
              <p>Live classes on Tuesdays, community debates on Saturdays.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Live sessions</p>
                <p className="value">{thisMonthEvents.length} events</p>
              </div>
              <div>
                <p className="label">Your RSVPs</p>
                <p className="value">{userRsvpCount} saved</p>
              </div>
              <Link className="cta small" href="/announcements">
                See reminders
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Month view</p>
              <h2>Community calendar</h2>
            </div>
            <p className="section-sub">
              All events are free. RSVP to get reminders and prep materials delivered.
            </p>
          </div>
          <div className="calendar-grid-wrap">
            <div className="calendar-toolbar">
              <button
                className="cta ghost small"
                type="button"
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                  )
                }
              >
                Previous
              </button>
              <div>
                <h3>{monthLabel}</h3>
                <p className="label">Classes, debate prep, competitions</p>
              </div>
              <button
                className="cta ghost small"
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
            {error ? <p className="label">{error}</p> : null}
            {loading ? <p className="label">Loading events...</p> : null}
            <div className="calendar-grid-month">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="calendar-cell empty" />;
                }
                const dayKey = day.toDateString();
                const dayEvents = eventsByDate.get(dayKey) || [];
                return (
                  <div key={dayKey} className="calendar-cell">
                    <span className="calendar-date">{day.getDate()}</span>
                    <div className="calendar-events">
                      {dayEvents.slice(0, 3).map((event) => {
                        const typeClass = EVENT_TYPES.includes(event.type)
                          ? event.type.toLowerCase().replace(" ", "-")
                          : "class";
                        const isRsvped = hasRsvp(event.id);
                        return (
                          <button
                            key={event.id}
                            type="button"
                            className={`calendar-event ${typeClass} ${isRsvped ? "rsvped" : ""}`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {isRsvped && "✓ "}
                            {event.title}
                          </button>
                        );
                      })}
                      {dayEvents.length > 3 ? (
                        <span className="label">+{dayEvents.length - 3} more</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {selectedEvent ? (
          <div className="event-modal-overlay" role="dialog" aria-modal="true">
            <div className="event-modal">
              <button
                className="event-modal-close"
                type="button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="event-modal-main">
                <p className="eyebrow">{selectedEvent.type}</p>
                <h2>{selectedEvent.title}</h2>
                <p className="lead">{selectedEvent.description || "Event details."}</p>
                <div className="event-modal-meta">
                  <div>
                    <p className="label">Date</p>
                    <p className="value">{formatDate(selectedEvent.start)}</p>
                  </div>
                  <div>
                    <p className="label">Start</p>
                    <p className="value">{formatTime(selectedEvent.start)}</p>
                  </div>
                  <div>
                    <p className="label">End</p>
                    <p className="value">{formatTime(selectedEvent.end)}</p>
                  </div>
                  <div>
                    <p className="label">Location</p>
                    <p className="value">{selectedEvent.location || "Online"}</p>
                  </div>
                </div>
                {selectedEvent.link ? (
                  <a
                    className="event-link"
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedEvent.link}
                  </a>
                ) : null}
              </div>
              <div className="event-modal-actions">
                {isLoggedIn ? (
                  <>
                    <button
                      className="cta"
                      type="button"
                      onClick={() => handleRsvp(selectedEvent, "saved")}
                      disabled={rsvpLoading}
                    >
                      {getRsvpStatus(selectedEvent.id) ? "Saved ✓" : "Save this event"}
                    </button>
                    <button
                      className="cta ghost"
                      type="button"
                      onClick={() => handleReminder(selectedEvent)}
                      disabled={rsvpLoading || getRsvpRecord(selectedEvent.id)?.reminderRequested}
                    >
                      {getRsvpRecord(selectedEvent.id)?.reminderRequested
                        ? "Email reminder set"
                        : "Get email notification"}
                    </button>
                  </>
                ) : (
                  <Link className="cta" href="/signin">
                    Sign in to save
                  </Link>
                )}
              </div>
              <p className="label">Reminders are sent 1 hour before the event.</p>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="footer">
        <div>
          <p className="logo-name">Mimir</p>
          <p className="footer-note">Community for serious language momentum.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/groups">Groups</Link>
          <Link href="/competitions">Debate</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
