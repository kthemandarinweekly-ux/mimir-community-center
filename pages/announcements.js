import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NavBar from "../components/NavBar";

export default function AnnouncementsPage() {
  const { data: session, status } = useSession();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    emailDigests: true,
    mobileAlerts: false,
    competitionReminders: true,
  });
  const [saving, setSaving] = useState(false);

  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements");
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

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

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    if (!session?.user?.email) return;

    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  // Get the latest announcement for the hero card
  const latestAnnouncement = announcements[0];

  return (
    <>
      <Head>
        <title>Mimir Community Center | Announcements</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact page-announcements">
        <NavBar />
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Announcements</span>
        </div>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Community updates</p>
            <h1>Announcements</h1>
            <p className="lead">
              Stay synced on topic packs, group updates, and competition reminders.
            </p>
            <div className="hero-actions">
              {isLoggedIn ? (
                <button className="cta" type="button" onClick={savePreferences} disabled={saving}>
                  {saving ? "Saving..." : "Save preferences"}
                </button>
              ) : (
                <Link className="cta" href="/signin">
                  Turn on notifications
                </Link>
              )}
              <Link className="cta ghost" href="/calendar">
                View calendar
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Latest drop</span>
              <h3>{latestAnnouncement?.title || "Climate migration pack"}</h3>
              <p>{latestAnnouncement?.body || "Key readings, debate frames, and discussion prompts."}</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Language</p>
                <p className="value">CN · EN · ES</p>
              </div>
              <div>
                <p className="label">Updated</p>
                <p className="value">
                  {latestAnnouncement?.publishedAt
                    ? new Date(latestAnnouncement.publishedAt).toLocaleDateString()
                    : "Today"}
                </p>
              </div>
              {latestAnnouncement?.actionLink ? (
                <Link className="cta small" href={latestAnnouncement.actionLink}>
                  {latestAnnouncement.actionLabel || "View"}
                </Link>
              ) : (
                <Link className="cta small" href="/groups">
                  Get the pack
                </Link>
              )}
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section split">
          <div className="announcement-panel">
            <p className="eyebrow">What&apos;s new</p>
            <h2>Latest announcements</h2>
            <p>
              Admins post weekly updates, mentor availability, and competition prep notes.
            </p>
            {loading ? (
              <p>Loading announcements...</p>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="notice">
                  <div>
                    <h4>{announcement.title}</h4>
                    <p>{announcement.body}</p>
                  </div>
                  {announcement.actionLink ? (
                    <Link className="cta small" href={announcement.actionLink}>
                      {announcement.actionLabel || "View"}
                    </Link>
                  ) : (
                    <Link className="cta small" href="/groups">
                      View
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="notice">
                  <div>
                    <h4>New topic pack: Climate migration</h4>
                    <p>Chinese + English tracks · vocabulary &amp; readings available.</p>
                  </div>
                  <Link className="cta small" href="/groups">
                    View pack
                  </Link>
                </div>
                <div className="notice">
                  <div>
                    <h4>Mentor office hours</h4>
                    <p>Spanish advanced · Fridays at 18:00 CET.</p>
                  </div>
                  <Link className="cta small" href="/calendar">
                    Book a slot
                  </Link>
                </div>
                <div className="notice">
                  <div>
                    <h4>Seasonal debate theme overview</h4>
                    <p>Review the topic framing and suggested subtopics.</p>
                  </div>
                  <Link className="cta small" href="/competitions">
                    View materials
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="notification-panel">
            <h3>Notification settings</h3>
            <p>Choose how you want to hear from us.</p>
            <div className="toggle">
              <span>Email digests</span>
              <button
                className="toggle-btn"
                type="button"
                aria-pressed={preferences.emailDigests}
                onClick={() => togglePreference("emailDigests")}
              >
                {preferences.emailDigests ? "On" : "Off"}
              </button>
            </div>
            <div className="toggle">
              <span>Mobile alerts</span>
              <button
                className="toggle-btn"
                type="button"
                aria-pressed={preferences.mobileAlerts}
                onClick={() => togglePreference("mobileAlerts")}
              >
                {preferences.mobileAlerts ? "On" : "Off"}
              </button>
            </div>
            <div className="toggle">
              <span>Competition reminders</span>
              <button
                className="toggle-btn"
                type="button"
                aria-pressed={preferences.competitionReminders}
                onClick={() => togglePreference("competitionReminders")}
              >
                {preferences.competitionReminders ? "On" : "Off"}
              </button>
            </div>
            {isLoggedIn ? (
              <button className="cta" type="button" onClick={savePreferences} disabled={saving}>
                {saving ? "Saving..." : "Update preferences"}
              </button>
            ) : (
              <Link className="cta" href="/signin">
                Sign in to save
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="logo-name">Mimir</p>
          <p className="footer-note">Community for serious language momentum.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/groups">Groups</Link>
          <Link href="/calendar">Calendar</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
