import Head from "next/head";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import MinimalNav from "../components/MinimalNav";
import { useProfile } from "../components/useProfile";
import { useMemberships } from "../components/useMemberships";
import { useBadge, BADGE_LEVELS, POINTS } from "../components/useBadge";
import { BadgeIcon, BadgeProgress, ShareableBadgeCard, LevelRules } from "../components/BadgeDisplay";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = nickname || defaultName;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    const signedInEmail = (session?.user?.email || "").toLowerCase();
    if (status === "authenticated" && adminEmails.includes(signedInEmail)) {
      router.replace("/admin");
    }
  }, [status, session?.user?.email, router]);

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

        // Fetch saved materials from API
        const savedResponse = await fetch(`/api/saved-materials?email=${encodeURIComponent(session.user.email)}`);
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setSavedMaterials((savedData.savedMaterials || []).map((m) => ({
            id: m.materialId,
            recordId: m.id,
            title: m.materialTitle,
            url: m.materialUrl,
            type: m.materialType,
            language: m.materialLanguage,
            savedAt: m.savedAt,
          })));
        }

        // Fetch user's threads (conversations they started)
        const threadsResponse = await fetch(`/api/threads?authorEmail=${encodeURIComponent(session.user.email)}`);
        if (threadsResponse.ok) {
          const threadsData = await threadsResponse.json();
          const userThreads = (threadsData.threads || []).map(t => ({
            ...t,
            type: "started",
          }));

          // Fetch user's replies
          const repliesResponse = await fetch(`/api/replies?authorEmail=${encodeURIComponent(session.user.email)}`);
          let userReplies = [];
          if (repliesResponse.ok) {
            const repliesData = await repliesResponse.json();
            userReplies = (repliesData.replies || []).map(r => ({
              id: r.id,
              title: r.threadTitle || "Thread reply",
              groupSlug: r.groupSlug,
              body: r.body,
              createdAt: r.createdAt,
              type: "replied",
              threadId: r.threadId,
            }));
          }

          // Combine and sort by date
          const allConversations = [...userThreads, ...userReplies]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
          setConversations(allConversations);
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

  const removeSavedMaterial = async (materialId) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/saved-materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          materialId: materialId,
        }),
      });

      if (response.ok) {
        setSavedMaterials((prev) => prev.filter((m) => m.id !== materialId));
      }
    } catch (error) {
      console.error("Failed to remove saved material:", error);
    }
  };

  // Calculate user stats for badge system
  const userStats = useMemo(() => {
    const threadsStarted = conversations.filter((c) => c.type === "started").length;
    const repliesMade = conversations.filter((c) => c.type === "replied").length;

    return {
      groupsJoined: memberships.length,
      eventsSaved: rsvps.length,
      materialsSaved: savedMaterials.length,
      threadsStarted,
      repliesMade,
    };
  }, [memberships.length, rsvps.length, savedMaterials.length, conversations]);

  // Get badge info
  const badgeInfo = useBadge(userStats);

  const nextStepActions = useMemo(() => {
    const actions = [
      {
        id: "groups",
        href: "/groups",
        title: "Find a group to join",
        description: "Join a language group first, then you can start or reply to topics.",
        cta: "Browse Groups",
      },
      {
        id: "calendar",
        href: "/calendar",
        title: "Check this week's live sessions",
        description: "Save a class on the calendar so you get reminders and easy access.",
        cta: "Open Calendar",
      },
      {
        id: "debate",
        href: "/debate",
        title: "Explore the teacher's debate topic",
        description: "Read the current season prompt and prepare ideas before discussions.",
        cta: "Go to Debate",
      },
      {
        id: "discussions",
        href: memberships.length > 0 ? `/groups/${memberships[0].groupSlug}` : "/groups",
        title: "Reply to a group topic",
        description: "Contribute one short reply to start building your conversation history.",
        cta: "Join Discussions",
      },
      {
        id: "materials",
        href: "/competitions",
        title: "Save learning materials",
        description: "Collect useful watch/read resources for quick review later.",
        cta: "Browse Materials",
      },
    ];

    let primaryId = "debate";
    if (userStats.groupsJoined === 0) primaryId = "groups";
    else if (userStats.eventsSaved === 0) primaryId = "calendar";
    else if (userStats.repliesMade === 0 && userStats.threadsStarted === 0) primaryId = "discussions";
    else if (userStats.materialsSaved === 0) primaryId = "materials";

    const primary = actions.find((action) => action.id === primaryId) || actions[0];
    const secondary = actions.filter((action) => action.id !== primary.id).slice(0, 2);
    return { primary, secondary };
  }, [memberships, userStats]);

  // Generate AI recommendations based on user's current activity
  const recommendations = useMemo(() => {
    const recs = [];

    // Priority 1: Join a group if none joined
    if (userStats.groupsJoined === 0) {
      recs.push({
        id: "join-group",
        icon: "👥",
        title: "Join your first group",
        description: `Join a language group to connect with other learners and earn +${POINTS.GROUP_JOIN} points!`,
        points: POINTS.GROUP_JOIN,
        link: "/groups",
        linkText: "Browse Groups",
        priority: 1,
      });
    }

    // Priority 2: Save an event
    if (userStats.eventsSaved === 0) {
      recs.push({
        id: "save-event",
        icon: "📅",
        title: "Save an upcoming event",
        description: `RSVP to a live session or class to earn +${POINTS.EVENT_SAVE} points and get reminders!`,
        points: POINTS.EVENT_SAVE,
        link: "/calendar",
        linkText: "View Calendar",
        priority: 2,
      });
    }

    // Priority 3: Start a discussion
    if (userStats.threadsStarted === 0) {
      recs.push({
        id: "start-discussion",
        icon: "💬",
        title: "Start a discussion",
        description: `Share your thoughts or ask a question to earn +${POINTS.THREAD_START} points!`,
        points: POINTS.THREAD_START,
        link: memberships.length > 0 ? `/groups/${memberships[0].groupSlug}` : "/groups",
        linkText: "Go to Group",
        priority: 3,
      });
    }

    // Priority 4: Reply to discussions
    if (userStats.repliesMade < 3) {
      recs.push({
        id: "reply-discussion",
        icon: "↩️",
        title: "Reply to a topic",
        description: `Engage with others by replying to discussions. Each reply earns +${POINTS.THREAD_REPLY} points!`,
        points: POINTS.THREAD_REPLY,
        link: memberships.length > 0 ? `/groups/${memberships[0].groupSlug}` : "/groups",
        linkText: "Join Discussions",
        priority: 4,
      });
    }

    // Priority 5: Save materials
    if (userStats.materialsSaved < 3) {
      recs.push({
        id: "save-materials",
        icon: "📚",
        title: "Save learning materials",
        description: `Build your study library by saving videos and articles. Each save earns +${POINTS.MATERIAL_SAVE} points!`,
        points: POINTS.MATERIAL_SAVE,
        link: "/competitions",
        linkText: "Browse Materials",
        priority: 5,
      });
    }

    // Priority 6: Join more groups
    if (userStats.groupsJoined > 0 && userStats.groupsJoined < 3) {
      recs.push({
        id: "more-groups",
        icon: "🌍",
        title: "Explore more languages",
        description: `Try joining another language group! Each group earns +${POINTS.GROUP_JOIN} points.`,
        points: POINTS.GROUP_JOIN,
        link: "/groups",
        linkText: "Find Groups",
        priority: 6,
      });
    }

    // Sort by priority and take top 3
    return recs.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [userStats, memberships]);

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
        <title>My Account | Mimir Language Community</title>
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
              <h1 className="welcome-with-badge">
                Welcome, {displayName}
                <BadgeIcon badge={badgeInfo.badge} size="medium" />
              </h1>
              <p className="account-subtitle">
                Manage your groups, track saved materials, and see upcoming events.
              </p>
            </div>
            <div className="account-header-side">
              <aside className="next-step-panel">
                <p className="next-step-kicker">Need a next step?</p>
                <h2>{nextStepActions.primary.title}</h2>
                <p className="next-step-description">{nextStepActions.primary.description}</p>
                <Link href={nextStepActions.primary.href} className="next-step-primary-cta">
                  {nextStepActions.primary.cta}
                </Link>
                <div className="next-step-secondary-list">
                  {nextStepActions.secondary.map((action) => (
                    <Link key={action.id} href={action.href} className="next-step-secondary-link">
                      {action.title}
                    </Link>
                  ))}
                </div>
              </aside>
              <button className="account-signout" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </button>
            </div>
          </section>

          {/* Badge Progress Section - Duolingo-inspired */}
          <section className="badge-section-duo">
            <div className="badge-hero-card">
              <div className="badge-hero-left">
                <div
                  className="badge-hero-icon"
                  style={{
                    background: `linear-gradient(145deg, ${badgeInfo.badge.gradientStart} 0%, ${badgeInfo.badge.gradientEnd} 100%)`,
                  }}
                >
                  <span className="badge-emoji">{badgeInfo.badge.emoji}</span>
                </div>
                <div className="badge-hero-info">
                  <span className="badge-hero-level">Level {badgeInfo.badge.level}</span>
                  <h2 className="badge-hero-name">{badgeInfo.badge.name}</h2>
                </div>
              </div>
              <div className="badge-hero-right">
                <div className="badge-points-display">
                  <span className="points-number">{badgeInfo.points}</span>
                  <span className="points-label">XP</span>
                </div>
              </div>
            </div>

            {/* Progress to Next Level */}
            {badgeInfo.nextBadge && (
              <div className="badge-progress-card">
                <div className="progress-header">
                  <span className="progress-title">Progress to {badgeInfo.nextBadge.name}</span>
                  <span className="progress-xp">{badgeInfo.pointsToNext} XP to go</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${badgeInfo.progress}%`,
                      background: `linear-gradient(90deg, ${badgeInfo.badge.color}, ${badgeInfo.nextBadge.color})`,
                    }}
                  />
                </div>
                <div className="progress-badges">
                  <div className="progress-badge current">
                    <span
                      className="mini-badge-icon"
                      style={{ background: badgeInfo.badge.color }}
                    >
                      {badgeInfo.badge.emoji}
                    </span>
                  </div>
                  <div className="progress-badge next">
                    <span
                      className="mini-badge-icon"
                      style={{ background: badgeInfo.nextBadge.color }}
                    >
                      {badgeInfo.nextBadge.emoji}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions to Level Up */}
            {recommendations.length > 0 && (
              <div className="level-up-actions">
                <h3 className="actions-title">Quick ways to earn XP</h3>
                <div className="actions-grid">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={rec.link} className="action-card">
                      <span className="action-icon">{rec.icon}</span>
                      <span className="action-label">{rec.title}</span>
                      <span className="action-points">+{rec.points} XP</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
            <div className="account-stat">
              <span className="stat-number">{conversations.length}</span>
              <span className="stat-label">Conversations</span>
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
              className={`account-tab ${activeTab === "badge" ? "active" : ""}`}
              onClick={() => setActiveTab("badge")}
            >
              My Badge
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

                {/* My Conversations */}
                <section className="account-section">
                  <div className="account-section-header">
                    <h2>My Conversations</h2>
                    <Link href="/groups" className="account-link">Join discussions</Link>
                  </div>
                  {loading ? (
                    <p className="account-empty">Loading...</p>
                  ) : conversations.length > 0 ? (
                    <div className="account-conversation-list">
                      {conversations.slice(0, 5).map((convo) => {
                        // For threads started, use thread id; for replies, use threadId
                        const threadId = convo.type === "started" ? convo.id : convo.threadId;
                        return (
                          <Link
                            key={convo.id}
                            href={`/groups/${convo.groupSlug}?thread=${threadId}`}
                            className="account-conversation-item"
                          >
                            <div className="conversation-badge">
                              {convo.type === "started" ? "Started" : "Replied"}
                            </div>
                            <div className="conversation-info">
                              <span className="conversation-title">{convo.title}</span>
                              <span className="conversation-preview">
                                {convo.body?.slice(0, 60) || "View discussion"}
                                {convo.body?.length > 60 ? "..." : ""}
                              </span>
                              <span className="conversation-meta">
                                {convo.createdAt
                                  ? new Date(convo.createdAt).toLocaleDateString()
                                  : "Recent"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="account-empty-state">
                      <p>No conversations yet.</p>
                      <p className="empty-hint">
                        Start or reply to discussions in your groups.
                      </p>
                      <Link href="/groups" className="account-cta">
                        Explore Groups
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "badge" && (
              <div className="badge-tab-content">
                <div className="badge-tab-grid">
                  {/* Shareable Badge Card */}
                  <div className="badge-card-section">
                    <h2>Your Badge</h2>
                    <p className="section-desc">Share your achievement with friends!</p>
                    <ShareableBadgeCard
                      badge={badgeInfo.badge}
                      userName={displayName}
                      points={badgeInfo.points}
                    />
                  </div>

                  {/* Level Rules */}
                  <div className="badge-rules-section">
                    <LevelRules />

                    {/* Points Breakdown */}
                    <div className="points-breakdown-section">
                      <h4>Your Points Breakdown</h4>
                      <div className="breakdown-grid">
                        <div className="breakdown-row">
                          <span className="breakdown-icon">👥</span>
                          <span className="breakdown-label">Groups Joined</span>
                          <span className="breakdown-calc">{userStats.groupsJoined} × {POINTS.GROUP_JOIN}</span>
                          <span className="breakdown-total">{userStats.groupsJoined * POINTS.GROUP_JOIN} pts</span>
                        </div>
                        <div className="breakdown-row">
                          <span className="breakdown-icon">📅</span>
                          <span className="breakdown-label">Events Saved</span>
                          <span className="breakdown-calc">{userStats.eventsSaved} × {POINTS.EVENT_SAVE}</span>
                          <span className="breakdown-total">{userStats.eventsSaved * POINTS.EVENT_SAVE} pts</span>
                        </div>
                        <div className="breakdown-row">
                          <span className="breakdown-icon">📚</span>
                          <span className="breakdown-label">Materials Saved</span>
                          <span className="breakdown-calc">{userStats.materialsSaved} × {POINTS.MATERIAL_SAVE}</span>
                          <span className="breakdown-total">{userStats.materialsSaved * POINTS.MATERIAL_SAVE} pts</span>
                        </div>
                        <div className="breakdown-row">
                          <span className="breakdown-icon">💬</span>
                          <span className="breakdown-label">Topics Started</span>
                          <span className="breakdown-calc">{userStats.threadsStarted} × {POINTS.THREAD_START}</span>
                          <span className="breakdown-total">{userStats.threadsStarted * POINTS.THREAD_START} pts</span>
                        </div>
                        <div className="breakdown-row">
                          <span className="breakdown-icon">↩️</span>
                          <span className="breakdown-label">Replies Made</span>
                          <span className="breakdown-calc">{userStats.repliesMade} × {POINTS.THREAD_REPLY}</span>
                          <span className="breakdown-total">{userStats.repliesMade * POINTS.THREAD_REPLY} pts</span>
                        </div>
                        <div className="breakdown-row total">
                          <span className="breakdown-icon">🏆</span>
                          <span className="breakdown-label">Total Points</span>
                          <span className="breakdown-calc"></span>
                          <span className="breakdown-total">{badgeInfo.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
