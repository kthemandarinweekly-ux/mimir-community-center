import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import NavBar from "../components/NavBar";
import { useMemberships } from "../components/useMemberships";

// Fallback groups data
const fallbackGroups = [
  {
    slug: "intermediate-chinese",
    name: "Intermediate Chinese",
    description: "Build fluency by turning news clips and essays into live debates.",
    focus: ["Weekly clinics", "Peer speaking pods"],
  },
  {
    slug: "advanced-chinese",
    name: "Advanced Chinese",
    description: "Sharpen nuance, rhetorical structure, and high-level vocabulary.",
    focus: ["Advanced discourse", "Judge feedback"],
  },
  {
    slug: "intermediate-spanish",
    name: "Intermediate Spanish",
    description: "Practice arguments that combine cultural context and real-world themes.",
    focus: ["Conversation ladders", "Media watchlists"],
  },
  {
    slug: "advanced-spanish",
    name: "Advanced Spanish",
    description: "Refine persuasive speaking with high-impact, rapid rebuttal drills.",
    focus: ["Expert mentor hours", "Style workshops"],
  },
  {
    slug: "intermediate-english",
    name: "Intermediate English",
    description: "Go beyond basics with guided speaking prompts and debate structures.",
    focus: ["Discussion circles", "Vocabulary labs"],
  },
  {
    slug: "advanced-english",
    name: "Advanced English",
    description: "Elevate tone, precision, and confidence for international discussions.",
    focus: ["Live critiques", "Argument polish"],
  },
];

function ToggleRow({ label, defaultOn, value, onChange }) {
  const isOn = value !== undefined ? value : defaultOn;

  return (
    <div className="toggle">
      <span>{label}</span>
      <button
        className="toggle-btn"
        type="button"
        aria-pressed={isOn}
        onClick={() => onChange && onChange(!isOn)}
      >
        {isOn ? "On" : "Off"}
      </button>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const { memberships, joinGroup, isMember } = useMemberships();
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    emailDigests: true,
    mobileAlerts: false,
    competitionReminders: true,
  });

  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch groups
        const groupsResponse = await fetch("/api/groups");
        if (groupsResponse.ok) {
          const data = await groupsResponse.json();
          setGroups(data.groups?.length > 0 ? data.groups : fallbackGroups);
        } else {
          setGroups(fallbackGroups);
        }

        // Fetch upcoming events
        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          setEvents(data.events || []);
        }

        // Fetch announcements
        const announcementsResponse = await fetch("/api/announcements?limit=3");
        if (announcementsResponse.ok) {
          const data = await announcementsResponse.json();
          setAnnouncements(data.announcements || []);
        }

        // Fetch competitions
        const compsResponse = await fetch("/api/competitions");
        if (compsResponse.ok) {
          const data = await compsResponse.json();
          setCompetitions(data.competitions || []);
        }
      } catch (error) {
        setGroups(fallbackGroups);
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user preferences if logged in
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchPreferences = async () => {
      try {
        const response = await fetch(`/api/preferences?email=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      }
    };

    fetchPreferences();
  }, [session?.user?.email]);

  const savePreferences = async () => {
    if (!session?.user?.email) return;

    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          ...preferences,
        }),
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const handleJoinGroup = async (group) => {
    if (!isLoggedIn) return;
    await joinGroup(group.slug, group.name);
  };

  // Get upcoming events for calendar preview
  const upcomingEvents = events
    .filter((e) => e.start && new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 4);

  // Get current competition info
  const currentCompetition = competitions[0];

  return (
    <>
      <Head>
        <title>Mimir Community Center</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header">
        <NavBar />
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">For fluent-at-basics language learners</p>
            <h1>Open Debate</h1>
            <p className="lead">
              A free international community for intermediate and advanced learners of Chinese,
              Spanish, and English. Join cohort-based groups, practice with peers, and prepare
              for seasonal debate competitions.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/groups">
                Join the community
              </Link>
              <Link className="cta ghost" href="/calendar">
                Explore the calendar
              </Link>
            </div>
            <div className="hero-meta">
              <div>
                <h4>6 learning tracks</h4>
                <p>Intermediate + advanced for each language</p>
              </div>
              <div>
                <h4>Weekly rhythms</h4>
                <p>Live classes, discussion prompts, and share-outs</p>
              </div>
              <div>
                <h4>Seasonal debates</h4>
                <p>Coached prep and global community sessions</p>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Next season theme</span>
              <h3>{currentCompetition?.theme || "Technology & human connection"}</h3>
              <p>Topic decks, reading lists, and speaking drills drop weekly.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Materials update</p>
                <p className="value">
                  {currentCompetition?.applicationDeadline
                    ? new Date(currentCompetition.applicationDeadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "May 14"}
                </p>
              </div>
              <div>
                <p className="label">Live kickoff</p>
                <p className="value">
                  {currentCompetition?.startDate
                    ? new Date(currentCompetition.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "May 18"}{" "}
                  · Online
                </p>
              </div>
              <Link className="cta small" href="/competitions">
                View season topic
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section id="groups" className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Join your track</p>
              <h2>Language groups built for momentum</h2>
            </div>
            <p className="section-sub">
              Each group has weekly discussion prompts, material sharing, and practice
              spaces for watch → read → speak progression.
            </p>
          </div>
          <div className="group-grid">
            {groups.slice(0, 6).map((group) => (
              <article key={group.slug} className="group-card">
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                <div className="tag-row">
                  {(group.focus || []).slice(0, 2).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                {isLoggedIn ? (
                  isMember(group.slug) ? (
                    <Link className="cta small" href={`/groups/${group.slug}`}>
                      View group
                    </Link>
                  ) : (
                    <button
                      className="cta small"
                      type="button"
                      onClick={() => handleJoinGroup(group)}
                    >
                      Join group
                    </button>
                  )
                ) : (
                  <Link className="cta small" href="/signin">
                    Join group
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="section highlight">
          <div className="section-head">
            <div>
              <p className="eyebrow">Community flow</p>
              <h2>A guided path to fluency</h2>
            </div>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step">01</span>
              <h3>Watch</h3>
              <p>Curated videos, debate sessions, and cultural clips to listen actively.</p>
            </div>
            <div className="flow-step">
              <span className="step">02</span>
              <h3>Read</h3>
              <p>Weekly packs with articles, transcripts, and topical vocabulary.</p>
            </div>
            <div className="flow-step">
              <span className="step">03</span>
              <h3>Speak</h3>
              <p>Group discussions, mentor sessions, and competition rehearsals.</p>
            </div>
          </div>
        </section>

        <section id="calendar" className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Community calendar</p>
              <h2>Classes, live rooms, and open practice</h2>
            </div>
            <p className="section-sub">
              Admins can publish free events and details; members can RSVP and sync
              reminders.
            </p>
          </div>
          <div className="calendar">
            <div className="calendar-header">
              <h3>
                {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <Link className="cta ghost small" href="/calendar">
                View full calendar
              </Link>
            </div>
            <div className="calendar-grid">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="calendar-item">
                    <p className="label">
                      {new Date(event.start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {event.type || "Event"}
                    </p>
                    <h4>{event.title}</h4>
                    <p>{event.description?.slice(0, 50) || "All levels"}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="calendar-item">
                    <p className="label">Upcoming · Live class</p>
                    <h4>Debate structure essentials</h4>
                    <p>All levels · 60 mins</p>
                  </div>
                  <div className="calendar-item">
                    <p className="label">Upcoming · Discussion</p>
                    <h4>Ethics of AI in education</h4>
                    <p>Intermediate cohorts</p>
                  </div>
                  <div className="calendar-item">
                    <p className="label">Upcoming · Workshop</p>
                    <h4>Rebuttal toolkit</h4>
                    <p>Advanced cohorts</p>
                  </div>
                  <div className="calendar-item">
                    <p className="label">Upcoming · Kickoff</p>
                    <h4>Seasonal debate launch</h4>
                    <p>All members · 90 mins</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section id="announcements" className="section split">
          <div className="announcement-panel">
            <p className="eyebrow">Announcements</p>
            <h2>Stay in the loop</h2>
            <p>
              Get notified when new materials drop, when registrations open, or when
              your group schedules a live room.
            </p>
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="notice">
                  <div>
                    <h4>{announcement.title}</h4>
                    <p>{announcement.body}</p>
                  </div>
                  <Link className="cta small" href="/announcements">
                    View
                  </Link>
                </div>
              ))
            ) : (
              <>
                <div className="notice">
                  <div>
                    <h4>New topic pack: Climate migration</h4>
                    <p>Chinese + English tracks · vocabulary &amp; readings available.</p>
                  </div>
                  <Link className="cta small" href="/announcements">
                    View pack
                  </Link>
                </div>
                <div className="notice">
                  <div>
                    <h4>Mentor office hours</h4>
                    <p>Spanish advanced · Fridays at 18:00 CET.</p>
                  </div>
                  <Link className="cta small" href="/announcements">
                    Book a slot
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="notification-panel">
            <h3>Notification settings</h3>
            <p>Choose how you want to hear from us.</p>
            <ToggleRow
              label="Email digests"
              value={preferences.emailDigests}
              onChange={(val) => setPreferences((p) => ({ ...p, emailDigests: val }))}
            />
            <ToggleRow
              label="Mobile alerts"
              value={preferences.mobileAlerts}
              onChange={(val) => setPreferences((p) => ({ ...p, mobileAlerts: val }))}
            />
            <ToggleRow
              label="Competition reminders"
              value={preferences.competitionReminders}
              onChange={(val) => setPreferences((p) => ({ ...p, competitionReminders: val }))}
            />
            {isLoggedIn ? (
              <button className="cta" type="button" onClick={savePreferences}>
                Update preferences
              </button>
            ) : (
              <Link className="cta" href="/signin">
                Sign in to save
              </Link>
            )}
          </div>
        </section>

        <section id="events" className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Debate competitions</p>
              <h2>Explore this season&apos;s debate theme</h2>
            </div>
            <p className="section-sub">
              Review the season focus, supporting materials, and suggested subtopics before
              joining discussions.
            </p>
          </div>
          <div className="events-grid">
            {competitions.length > 0 ? (
              competitions.slice(0, 3).map((comp) => (
                <article key={comp.slug} className="event-card">
                  <div>
                    <p className="label">Season spotlight</p>
                    <h3>{comp.name}</h3>
                    <p>{comp.description}</p>
                  </div>
                  <Link className="cta small" href="/competitions">
                    View materials
                  </Link>
                </article>
              ))
            ) : (
              <>
                <article className="event-card">
                  <div>
                    <p className="label">Season spotlight</p>
                    <h3>International friendly match</h3>
                    <p>Pair with a partner from another language track.</p>
                  </div>
                  <Link className="cta small" href="/competitions">
                    View materials
                  </Link>
                </article>
                <article className="event-card">
                  <div>
                    <p className="label">Season spotlight</p>
                    <h3>Regional language showcase</h3>
                    <p>Practice within your cohort and share feedback.</p>
                  </div>
                  <Link className="cta small" href="/competitions">
                    View materials
                  </Link>
                </article>
                <article className="event-card">
                  <div>
                    <p className="label">Season spotlight</p>
                    <h3>Global debate summit</h3>
                    <p>Community showcase with guest mentors.</p>
                  </div>
                  <Link className="cta small" href="/competitions">
                    View materials
                  </Link>
                </article>
              </>
            )}
          </div>
        </section>

        <section className="cta-section">
          <div>
            <h2>Ready to find your people?</h2>
            <p>
              Join the Mimir Community Center and meet learners who want to
              practice, debate, and grow beyond the basics.
            </p>
          </div>
          <div className="cta-actions">
            <Link className="cta" href="/groups">
              Join for free
            </Link>
            <Link className="cta ghost" href="/signin">
              {isLoggedIn ? "Go to dashboard" : "Sign in"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="logo-name">Mimir</p>
          <p className="footer-note">Community for serious language momentum.</p>
        </div>
        <div className="footer-links">
          <Link href="/groups">Groups</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/competitions">Debate</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
