import Head from "next/head";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { useProfile } from "../components/useProfile";
import { useMemberships } from "../components/useMemberships";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { profile, saveProfile } = useProfile();
  const { memberships } = useMemberships();
  const defaultName = session?.user?.name || session?.user?.email || "Member";
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [avatarChoice, setAvatarChoice] = useState(profile.avatar || "sunrise");
  const [saved, setSaved] = useState(false);

  // Dashboard data
  const [rsvps, setRsvps] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = nickname || defaultName;
  const avatarOptions = useMemo(
    () => [
      { id: "sunrise", label: "Sunrise", src: "/avatars/sunrise.svg" },
      { id: "berry", label: "Berry", src: "/avatars/berry.svg" },
      { id: "plum", label: "Plum", src: "/avatars/plum.svg" },
      { id: "mint", label: "Mint", src: "/avatars/mint.svg" },
      { id: "ember", label: "Ember", src: "/avatars/ember.svg" },
    ],
    []
  );

  useEffect(() => {
    setNickname(profile.nickname || "");
    setAvatarChoice(profile.avatar || "sunrise");
  }, [profile.nickname, profile.avatar]);

  // Fetch dashboard data
  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch RSVPs
        const rsvpResponse = await fetch(`/api/rsvps?email=${encodeURIComponent(session.user.email)}`);
        if (rsvpResponse.ok) {
          const data = await rsvpResponse.json();
          setRsvps(data.rsvps || []);
        }

        // Fetch events
        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          setEvents(data.events || []);
        }

        // Fetch announcements
        const announcementsResponse = await fetch("/api/announcements?limit=5");
        if (announcementsResponse.ok) {
          const data = await announcementsResponse.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.email]);

  const handleSave = () => {
    saveProfile({ nickname: nickname.trim(), avatar: avatarChoice });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get upcoming events user has RSVPed to
  const upcomingRsvpEvents = useMemo(() => {
    const now = new Date();
    return rsvps
      .map((rsvp) => {
        const event = events.find((e) => e.id === rsvp.eventId);
        return event ? { ...event, rsvpStatus: rsvp.status } : null;
      })
      .filter((event) => event && event.start && new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 4);
  }, [rsvps, events]);

  return (
    <>
      <Head>
        <title>Mimir Community Center | User Center</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact page-account">
        <NavBar />
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Account</span>
        </div>
        <section className="hero account-hero">
          <div className="hero-copy">
            <p className="eyebrow">Your dashboard</p>
            <div className="name-row">
              <img
                className="name-avatar"
                src={`/avatars/${avatarChoice}.svg`}
                alt="User avatar"
              />
              <h1>{displayName}</h1>
            </div>
            <p className="lead">
              Manage your groups and track your activity.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/groups">
                Browse groups
              </Link>
              <button className="cta ghost" type="button" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Membership status</span>
              <h3>Active member</h3>
              <p>Keep your profile updated to get matched with debate partners.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Groups joined</p>
                <p className="value">{memberships.length}</p>
              </div>
              <Link className="cta small" href="/competitions">
                Manage entries
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        {status === "unauthenticated" ? (
          <section className="section">
            <div className="notice">
              <div>
                <h4>You&apos;re not signed in</h4>
                <p>Sign in to personalize your dashboard.</p>
              </div>
              <Link className="cta small" href="/signin">
                Sign in
              </Link>
            </div>
          </section>
        ) : (
          <section className="section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Your activity</p>
                <h2>Your community dashboard</h2>
              </div>
              <p className="section-sub">
                Everything you follow lives here. Update preferences any time.
              </p>
            </div>
            <div className="account-grid">
              <article className="account-card profile-card">
                <h3>Profile settings</h3>
                <div className="profile-preview">
                  <img
                    className="avatar-img"
                    src={`/avatars/${avatarChoice}.svg`}
                    alt="Selected avatar"
                  />
                  <div>
                    <p className="label">Display name</p>
                    <p className="value">{displayName}</p>
                  </div>
                </div>
                <label className="profile-field">
                  Nickname
                  <input
                    type="text"
                    placeholder="Add a nickname"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                  />
                </label>
                <div className="avatar-grid">
                  {avatarOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`avatar-option ${
                        avatarChoice === option.id ? "selected" : ""
                      }`}
                      onClick={() => setAvatarChoice(option.id)}
                    >
                      <img className="avatar-img" src={option.src} alt={option.label} />
                      {option.label}
                    </button>
                  ))}
                </div>
                <button className="cta small" type="button" onClick={handleSave}>
                  {saved ? "Saved!" : "Save changes"}
                </button>
              </article>

              <article className="account-card">
                <h3>Groups you joined</h3>
                {loading ? (
                  <p className="label">Loading...</p>
                ) : memberships.length > 0 ? (
                  <ul className="list">
                    {memberships.map((membership) => (
                      <li key={membership.id} className="list-item">
                        <Link href={`/groups/${membership.groupSlug}`}>
                          {membership.groupName || membership.groupSlug}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="label">You haven't joined any groups yet.</p>
                )}
                <Link className="cta small" href="/groups">
                  {memberships.length > 0 ? "Manage groups" : "Browse groups"}
                </Link>
              </article>

              <article className="account-card">
                <h3>Your calendar</h3>
                {loading ? (
                  <p className="label">Loading...</p>
                ) : upcomingRsvpEvents.length > 0 ? (
                  <ul className="list">
                    {upcomingRsvpEvents.map((event) => (
                      <li key={event.id} className="list-item">
                        {new Date(event.start).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {event.title}
                        {event.rsvpStatus ? ` · ${event.rsvpStatus}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="label">No upcoming RSVPs.</p>
                )}
                <Link className="cta small" href="/calendar">
                  View calendar
                </Link>
              </article>

              <article className="account-card">
                <h3>Announcements for you</h3>
                {loading ? (
                  <p className="label">Loading...</p>
                ) : announcements.length > 0 ? (
                  <ul className="list">
                    {announcements.slice(0, 3).map((announcement) => (
                      <li key={announcement.id} className="list-item">
                        {announcement.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="label">No new announcements.</p>
                )}
                <Link className="cta small" href="/announcements">
                  See all
                </Link>
              </article>

            </div>
          </section>
        )}
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
