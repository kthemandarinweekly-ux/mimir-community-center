import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import NavBar from "../components/NavBar";
import { useProfile } from "../components/useProfile";
import { getCurrentSeason } from "../data/seasons";
import { calculatePoints, getBadgeLevel } from "../components/useBadge";

const AVATAR_OPTIONS = ["sunrise", "mint", "plum", "ember", "berry"];

export default function AdminPage() {
  const currentSeason = getCurrentSeason();
  const { data: session } = useSession();
  const { profile, saveProfile } = useProfile();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const currentEmail = (session?.user?.email || "").toLowerCase();
  const isAdmin = adminEmails.includes(currentEmail);

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("sunrise");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNickname(profile.nickname || "");
    setSelectedAvatar(profile.avatar || "sunrise");
  }, [profile.nickname, profile.avatar]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, membersRes, membershipsRes, threadsRes, repliesRes, announcementsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/members"),
        fetch("/api/memberships"),
        fetch("/api/threads"),
        fetch("/api/replies"),
        fetch("/api/announcements?limit=20"),
      ]);
      const materialsRes = await fetch(`/api/materials?seasonId=${encodeURIComponent(currentSeason.id)}`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
      if (membershipsRes.ok) {
        const membershipsData = await membershipsRes.json();
        setMemberships(membershipsData.memberships || []);
      }
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData.threads || []);
      }
      if (repliesRes.ok) {
        const repliesData = await repliesRes.json();
        setReplies(repliesData.replies || []);
      }
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData.announcements || []);
      }
      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setMaterials(materialsData.materials || []);
      }
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      setError("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, currentSeason.id]);

  const handleSaveProfile = () => {
    saveProfile({ nickname: nickname.trim(), avatar: selectedAvatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const memberDirectory = (() => {
    const map = new Map();
    const addOrMerge = ({ email, name }) => {
      if (!email) return;
      const key = email.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          email,
          name: name || "Member",
          groups: [],
          groupCount: 0,
          threads: 0,
          replies: 0,
          status: "member",
          badgePoints: 0,
          badgeName: "Newcomer",
          badgeEmoji: "🌱",
          badgeColor: "#FFD93D",
          badgeLevel: 1,
        });
      } else if (name && !map.get(key).name) {
        map.get(key).name = name;
      }
    };

    members.forEach((member) =>
      addOrMerge({ email: member.email, name: member.name })
    );
    memberships.forEach((membership) =>
      addOrMerge({ email: membership.userEmail, name: membership.userName })
    );

    memberships.forEach((membership) => {
      const entry = map.get((membership.userEmail || "").toLowerCase());
      if (!entry) return;
      if (membership.groupName && !entry.groups.includes(membership.groupName)) {
        entry.groups.push(membership.groupName);
      }
      if (!membership.groupName && membership.groupSlug && !entry.groups.includes(membership.groupSlug)) {
        entry.groups.push(membership.groupSlug);
      }
      entry.groupCount = entry.groups.length;
    });

    threads.forEach((thread) => {
      const entry = map.get((thread.authorEmail || "").toLowerCase());
      if (entry) entry.threads += 1;
    });

    replies.forEach((reply) => {
      const entry = map.get((reply.authorEmail || "").toLowerCase());
      if (entry) entry.replies += 1;
    });

    map.forEach((entry, key) => {
      const points = calculatePoints({
        groupsJoined: entry.groupCount,
        eventsSaved: 0,
        materialsSaved: 0,
        threadsStarted: entry.threads,
        repliesMade: entry.replies,
      });
      const badge = getBadgeLevel(points);

      entry.badgePoints = points;
      entry.badgeName = badge.name;
      entry.badgeEmoji = badge.emoji;
      entry.badgeColor = badge.color;
      entry.badgeLevel = badge.level;

      if (adminEmails.includes(key)) {
        entry.status = "admin";
      } else if (entry.groupCount > 0) {
        entry.status = "active member";
      } else {
        entry.status = "member";
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.status === "admin" && b.status !== "admin") return -1;
      if (a.status !== "admin" && b.status === "admin") return 1;
      if (b.badgeLevel !== a.badgeLevel) return b.badgeLevel - a.badgeLevel;
      return b.groupCount - a.groupCount;
    });
  })();

  const now = new Date();
  const upcomingEvents = events
    .filter((event) => event.start && new Date(event.start) >= now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 8);
  const recentReplies = [...replies]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);
  const recentAnnouncements = [...announcements]
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 8);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentReplyCount = replies.filter((reply) => reply.createdAt && new Date(reply.createdAt) >= sevenDaysAgo).length;
  const recentAnnouncementCount = announcements.filter((item) => item.publishedAt && new Date(item.publishedAt) >= sevenDaysAgo).length;
  const membersWithoutGroups = memberDirectory.filter((m) => m.groupCount === 0).length;

  const healthChecks = [
    {
      id: "no-events",
      ok: upcomingEvents.length > 0,
      text: upcomingEvents.length > 0
        ? `${upcomingEvents.length} upcoming event(s) scheduled`
        : "No upcoming events scheduled",
    },
    {
      id: "reply-activity",
      ok: recentReplyCount > 0,
      text: recentReplyCount > 0
        ? `${recentReplyCount} reply/replies in the last 7 days`
        : "No replies in the last 7 days",
    },
    {
      id: "announcement-activity",
      ok: recentAnnouncementCount > 0,
      text: recentAnnouncementCount > 0
        ? `${recentAnnouncementCount} announcement(s) posted in the last 7 days`
        : "No announcements posted in the last 7 days",
    },
    {
      id: "season-materials",
      ok: materials.length >= 6,
      text: materials.length >= 6
        ? `${materials.length} material(s) available for ${currentSeason.label}`
        : `Only ${materials.length} material(s) for ${currentSeason.label} (recommended: 6+)`,
    },
    {
      id: "member-coverage",
      ok: membersWithoutGroups === 0,
      text: membersWithoutGroups === 0
        ? "All members are assigned to at least one group"
        : `${membersWithoutGroups} member(s) are not in any group`,
    },
  ];
  const warningChecks = healthChecks.filter((item) => !item.ok);

  return (
    <>
      <Head>
        <title>Mimir Community Center | Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact">
        <NavBar action={{ label: "User center", href: "/account" }} />
        <section className="detail-hero">
          <div>
            <p className="eyebrow">Admin center</p>
            <h1>Community operations dashboard</h1>
            <p className="lead">
              Real-time website status from Airtable. Edit content directly in Airtable, monitor everything here.
            </p>
            <button
              className="cta ghost small"
              type="button"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              style={{ marginTop: "12px" }}
            >
              Sign out
            </button>
          </div>
        </section>
      </header>

      <main className="section admin-layout">
        {!isAdmin ? (
          <div className="notice">
            <div>
              <h4>Admin access only</h4>
              <p>Add your email to NEXT_PUBLIC_ADMIN_EMAILS to unlock this view.</p>
            </div>
            <Link className="cta small" href="/signin">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <section className="admin-card">
              <h2>Overview</h2>
              {loading ? <p className="label">Loading dashboard...</p> : null}
              <div className="stat-grid two">
                <div>
                  <p className="label">Members</p>
                  <p className="value">{members.length}</p>
                </div>
                <div>
                  <p className="label">Events</p>
                  <p className="value">{events.length}</p>
                </div>
                <div>
                  <p className="label">Topics</p>
                  <p className="value">{threads.length}</p>
                </div>
                <div>
                  <p className="label">Replies</p>
                  <p className="value">{replies.length}</p>
                </div>
                <div>
                  <p className="label">Announcements</p>
                  <p className="value">{announcements.length}</p>
                </div>
                <div>
                  <p className="label">Upcoming Events</p>
                  <p className="value">{upcomingEvents.length}</p>
                </div>
              </div>
            </section>

            <section className="admin-card">
              <h2>Health Panel</h2>
              <p className="label">Operational signals from the last 7 days and current season readiness.</p>
              <p className="label admin-sync-time">
                Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Not synced yet"}
              </p>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <span>Status</span>
                  <span>Signal</span>
                </div>
                {healthChecks.map((check) => (
                  <div key={check.id} className="admin-row">
                    <span className={`admin-health-pill ${check.ok ? "ok" : "warn"}`}>
                      {check.ok ? "OK" : "Warning"}
                    </span>
                    <span>{check.text}</span>
                  </div>
                ))}
              </div>
              {warningChecks.length > 0 ? (
                <p className="label" style={{ color: "#c0392b" }}>
                  {warningChecks.length} warning(s) need attention in Airtable.
                </p>
              ) : (
                <p className="label" style={{ color: "#1f8a4d" }}>
                  All checks are healthy.
                </p>
              )}
            </section>

            <section className="admin-card">
              <h2>Admin Profile</h2>
              <p className="label">Change your admin display name and avatar (same profile system as user dashboard).</p>
              <div className="account-settings-form">
                <label className="settings-field">
                  <span>Display Name</span>
                  <input
                    type="text"
                    placeholder="Enter admin display name"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Email</span>
                  <input type="email" value={session?.user?.email || ""} disabled />
                </label>
                <div className="settings-field">
                  <span>Avatar</span>
                  <div className="avatar-grid">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        className={`avatar-option ${selectedAvatar === avatar ? "selected" : ""}`}
                        onClick={() => setSelectedAvatar(avatar)}
                      >
                        <img src={`/avatars/${avatar}.svg`} alt={`${avatar} avatar`} className="avatar-img" />
                      </button>
                    ))}
                  </div>
                </div>
                <button className="settings-save" type="button" onClick={handleSaveProfile}>
                  {saved ? "Saved!" : "Save Profile"}
                </button>
              </div>
            </section>

            <section className="admin-card">
              <h2>Members Directory</h2>
              {loading ? <p className="label">Loading members...</p> : null}
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Status</span>
                  <span>Groups</span>
                </div>
                {memberDirectory.length === 0 ? (
                  <div className="admin-row">
                    <span>No members yet</span>
                    <span>members@example.com</span>
                    <span>member</span>
                    <span>-</span>
                  </div>
                ) : (
                  memberDirectory.map((user) => (
                    <div key={user.email || user.name} className="admin-row">
                      <span>{user.name}</span>
                      <span>{user.email}</span>
                      <span>
                        <span
                          className={`admin-member-badge ${user.status === "admin" ? "admin" : ""}`}
                          style={{
                            borderColor: user.badgeColor,
                            color: user.status === "admin" ? "#5b34cf" : "#1a1425",
                          }}
                        >
                          {user.status === "admin" ? "🛡️ Admin" : user.badgeEmoji} {user.badgeName}
                        </span>
                      </span>
                      <span>
                        {user.groups.length > 0 ? user.groups.join(", ") : "No groups"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="admin-card">
              <h2>Notifications & Activity</h2>
              {error ? <p className="label">{error}</p> : null}
              <div className="admin-event">
                <div>
                  <h3>Recent Announcements</h3>
                  <p className="label">Pulled from Airtable Announcements table</p>
                </div>
                <div className="admin-table">
                  <div className="admin-row admin-head">
                    <span>Title</span>
                    <span>Type</span>
                    <span>Published</span>
                  </div>
                  {recentAnnouncements.length === 0 ? (
                    <div className="admin-row">
                      <span>No announcements</span>
                      <span>-</span>
                      <span>-</span>
                    </div>
                  ) : (
                    recentAnnouncements.map((item) => (
                      <div key={item.id} className="admin-row">
                        <span>{item.title}</span>
                        <span>{item.type || "general"}</span>
                        <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Recent"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="admin-event">
                <div>
                  <h3>Recent Replies</h3>
                  <p className="label">Latest discussion activity</p>
                </div>
                <div className="admin-table">
                  <div className="admin-row admin-head">
                    <span>Author</span>
                    <span>Reply</span>
                    <span>Date</span>
                  </div>
                  {recentReplies.length === 0 ? (
                    <div className="admin-row">
                      <span>No replies</span>
                      <span>-</span>
                      <span>-</span>
                    </div>
                  ) : (
                    recentReplies.map((reply) => (
                      <div key={reply.id} className="admin-row">
                        <span>{reply.authorName || "Member"}</span>
                        <span>{reply.body?.slice(0, 80) || "Reply"}</span>
                        <span>{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : "Recent"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="admin-event">
                <div>
                  <h3>Upcoming Events Snapshot</h3>
                  <p className="label">Read-only view; edit in Airtable</p>
                </div>
                <div className="admin-table">
                  <div className="admin-row admin-head">
                    <span>Event</span>
                    <span>Type</span>
                    <span>Date</span>
                  </div>
                  {upcomingEvents.length === 0 ? (
                    <div className="admin-row">
                      <span>No upcoming events</span>
                      <span>-</span>
                      <span>-</span>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="admin-row">
                        <span>{event.title}</span>
                        <span>{event.type || "Class"}</span>
                        <span>{event.start ? new Date(event.start).toLocaleDateString() : "TBD"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="notice" style={{ marginTop: "16px" }}>
                <div>
                  <h4>Source of truth</h4>
                  <p>To add or edit content, update Airtable tables. This admin center is dashboard-only monitoring.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
