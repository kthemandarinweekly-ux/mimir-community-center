import Head from "next/head";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import MinimalNav from "../components/MinimalNav";
import { useProfile } from "../components/useProfile";
import { useMemberships } from "../components/useMemberships";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile, saveProfile } = useProfile();
  const { memberships } = useMemberships();
  const defaultName = session?.user?.name || session?.user?.email || "Member";
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Dashboard data
  const [rsvps, setRsvps] = useState([]);
  const [events, setEvents] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = nickname || defaultName;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    setNickname(profile.nickname || "");
  }, [profile.nickname]);

  // Fetch dashboard data
  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const rsvpResponse = await fetch(`/api/rsvps?email=${encodeURIComponent(session.user.email)}`);
        if (rsvpResponse.ok) {
          const data = await rsvpResponse.json();
          setRsvps(data.rsvps || []);
        }

        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          setEvents(data.events || []);
        }

        // Fetch saved materials from localStorage for now
        const saved = JSON.parse(localStorage.getItem("savedMaterials") || "[]");
        setSavedMaterials(saved);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.email]);

  const handleSave = () => {
    saveProfile({ nickname: nickname.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get upcoming events user has RSVPed to
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return rsvps
      .map((rsvp) => {
        const event = events.find((e) => e.id === rsvp.eventId);
        return event ? { ...event, rsvpStatus: rsvp.status } : null;
      })
      .filter((event) => event && event.start && new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5);
  }, [rsvps, events]);

  const removeSavedMaterial = (id) => {
    const updated = savedMaterials.filter((m) => m.id !== id);
    setSavedMaterials(updated);
    localStorage.setItem("savedMaterials", JSON.stringify(updated));
  };

  if (status === "loading") {
    return (
      <div className="minimal-page">
        <MinimalNav />
        <main className="minimal-content">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Account | Open Debate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="minimal-page">
        <MinimalNav />

        <main className="account-container">
          {/* Account Header */}
          <section className="account-header">
            <div className="account-welcome">
              <p className="minimal-label">Your Dashboard</p>
              <h1>Welcome, {displayName}</h1>
              <p className="account-subtitle">
                Manage your groups, track saved materials, and see upcoming events.
              </p>
            </div>
            <button className="account-signout" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </button>
          </section>

          {/* Quick Stats */}
          <section className="account-stats">
            <div className="account-stat">
              <span className="stat-number">{memberships.length}</span>
              <span className="stat-label">Groups Joined</span>
            </div>
            <div className="account-stat">
              <span className="stat-number">{upcomingEvents.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
            <div className="account-stat">
              <span className="stat-number">{savedMaterials.length}</span>
              <span className="stat-label">Saved Materials</span>
            </div>
          </section>

          {/* Tabs */}
          <div className="account-tabs">
            <button
              className={`account-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`account-tab ${activeTab === "materials" ? "active" : ""}`}
              onClick={() => setActiveTab("materials")}
            >
              Saved Materials
            </button>
            <button
              className={`account-tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="account-content">
            {activeTab === "overview" && (
              <div className="account-overview">
                {/* My Groups */}
                <section className="account-section">
                  <div className="account-section-header">
                    <h2>My Groups</h2>
                    <Link href="/groups" className="account-link">Browse more</Link>
                  </div>
                  {loading ? (
                    <p className="account-empty">Loading...</p>
                  ) : memberships.length > 0 ? (
                    <div className="account-group-list">
                      {memberships.map((m) => (
                        <Link
                          key={m.id}
                          href={`/groups/${m.groupSlug}`}
                          className="account-group-item"
                        >
                          <span className="group-name">{m.groupName || m.groupSlug}</span>
                          <span className="group-arrow">→</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="account-empty-state">
                      <p>You haven't joined any groups yet.</p>
                      <Link href="/groups" className="account-cta">
                        Find a Group
                      </Link>
                    </div>
                  )}
                </section>

                {/* Upcoming Events */}
                <section className="account-section">
                  <div className="account-section-header">
                    <h2>Upcoming Events</h2>
                    <Link href="/calendar" className="account-link">View calendar</Link>
                  </div>
                  {loading ? (
                    <p className="account-empty">Loading...</p>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="account-event-list">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="account-event-item">
                          <div className="event-date">
                            <span className="event-month">
                              {new Date(event.start).toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="event-day">
                              {new Date(event.start).getDate()}
                            </span>
                          </div>
                          <div className="event-info">
                            <span className="event-title">{event.title}</span>
                            <span className="event-time">
                              {new Date(event.start).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="account-empty-state">
                      <p>No upcoming events saved.</p>
                      <Link href="/calendar" className="account-cta">
                        Browse Calendar
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "materials" && (
              <section className="account-section full">
                <h2>Saved Materials</h2>
                <p className="account-section-desc">
                  Materials you've saved from groups and the debate topic page.
                </p>
                {savedMaterials.length > 0 ? (
                  <div className="account-materials-list">
                    {savedMaterials.map((material) => (
                      <div key={material.id} className="account-material-item">
                        <div className="material-info">
                          <span className="material-type">{material.type}</span>
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noreferrer"
                            className="material-title"
                          >
                            {material.title}
                          </a>
                          {material.description && (
                            <span className="material-desc">{material.description}</span>
                          )}
                        </div>
                        <button
                          className="material-remove"
                          onClick={() => removeSavedMaterial(material.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="account-empty-state">
                    <p>You haven't saved any materials yet.</p>
                    <p className="empty-hint">
                      Browse materials in your groups or the debate topic page and click "Save" to add them here.
                    </p>
                    <Link href="/competitions" className="account-cta">
                      Browse Materials
                    </Link>
                  </div>
                )}
              </section>
            )}

            {activeTab === "settings" && (
              <section className="account-section full">
                <h2>Profile Settings</h2>
                <div className="account-settings-form">
                  <label className="settings-field">
                    <span>Display Name</span>
                    <input
                      type="text"
                      placeholder="Enter a nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </label>
                  <label className="settings-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                    />
                    <span className="field-hint">Email cannot be changed</span>
                  </label>
                  <button
                    className="settings-save"
                    onClick={handleSave}
                  >
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
