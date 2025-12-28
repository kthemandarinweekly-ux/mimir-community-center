import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <header className="site-header">
        <NavBar />
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Community schedule</p>
            <h1>Calendar of classes and debate prep</h1>
            <p className="lead">
              Stay ahead with a clear weekly rhythm. Admins post free sessions, topical
              discussions, and competition milestones.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/signin">
                RSVP to sessions
              </Link>
              <Link className="cta ghost" href="/competitions">
                View competition timeline
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">This month</span>
              <h3>May cohort rhythm</h3>
              <p>Live classes on Tuesdays, community debates on Saturdays.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Live sessions</p>
                <p className="value">8 events</p>
              </div>
              <div>
                <p className="label">Discussion rooms</p>
                <p className="value">12 rooms</p>
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
                        return (
                          <button
                            key={event.id}
                            type="button"
                            className={`calendar-event ${typeClass}`}
                            onClick={() => setSelectedEvent(event)}
                          >
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
          <section className="section detail-layout">
            <div className="detail-main">
              <div className="detail-section">
                <p className="eyebrow">{selectedEvent.type}</p>
                <h2>{selectedEvent.title}</h2>
                <p className="lead">{selectedEvent.description || "Event details."}</p>
                <div className="detail-actions">
                  <Link className="cta" href="/signin">
                    RSVP for this event
                  </Link>
                  {selectedEvent.link ? (
                    <Link className="cta ghost" href={selectedEvent.link}>
                      Open link
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
            <aside className="detail-side">
              <div className="side-card">
                <h3>Event details</h3>
                <div className="stat-grid">
                  <div>
                    <p className="label">Date</p>
                    <p className="value">
                      {selectedEvent.start
                        ? new Date(selectedEvent.start).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="label">Time</p>
                    <p className="value">
                      {selectedEvent.start
                        ? new Date(selectedEvent.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="label">Location</p>
                    <p className="value">{selectedEvent.location || "Online"}</p>
                  </div>
                </div>
                <button
                  className="cta ghost small"
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </aside>
          </section>
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
          <Link href="/competitions">Competitions</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
