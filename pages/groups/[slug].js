import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NavBar from "../../components/NavBar";
import { useProfile } from "../../components/useProfile";
import { useMemberships } from "../../components/useMemberships";
import { getBadgeLevel } from "../../components/useBadge";

// Fallback group data
const fallbackGroups = {
  "intermediate-chinese": {
    name: "Intermediate Chinese",
    level: "Intermediate",
    description: "Build fluency by turning news clips, essays, and debate motions into speaking practice.",
    focus: ["Weekly clinics", "Speaking pods", "Structured feedback"],
    nextEvent: "May 10 · Debate structure essentials",
  },
  "advanced-chinese": {
    name: "Advanced Chinese",
    level: "Advanced",
    description: "Sharpen nuance, rhetorical structure, and advanced vocabulary for deeper debates.",
    focus: ["High-level discourse", "Judge reviews", "Rebuttal drills"],
    nextEvent: "May 12 · Rebuttal toolkit",
  },
  "intermediate-spanish": {
    name: "Intermediate Spanish",
    level: "Intermediate",
    description: "Practice arguments that combine cultural context and real-world themes.",
    focus: ["Conversation ladders", "Media watchlists", "Weekly prompts"],
    nextEvent: "May 08 · Ethics of AI in education",
  },
  "advanced-spanish": {
    name: "Advanced Spanish",
    level: "Advanced",
    description: "Refine persuasive speaking with high-impact, rapid rebuttal drills.",
    focus: ["Expert mentor hours", "Style workshops", "Cross-track debates"],
    nextEvent: "May 14 · Advanced rebuttal lab",
  },
  "intermediate-english": {
    name: "Intermediate English",
    level: "Intermediate",
    description: "Go beyond basics with guided speaking prompts and debate structures.",
    focus: ["Discussion circles", "Vocabulary labs", "Peer reviews"],
    nextEvent: "May 06 · Opening statements clinic",
  },
  "advanced-english": {
    name: "Advanced English",
    level: "Advanced",
    description: "Elevate tone, precision, and confidence for international discussions.",
    focus: ["Live critiques", "Argument polish", "Competition prep"],
    nextEvent: "May 16 · Argument polish lab",
  },
};

export default function GroupDetailPage() {
  const router = useRouter();
  const { slug, thread: threadParam } = router.query;
  const { data: session, status } = useSession();
  const { profile } = useProfile();
  const { isMember, joinGroup, leaveGroup } = useMemberships();

  const [group, setGroup] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [members, setMembers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", body: "" });
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [postingReply, setPostingReply] = useState(false);
  const [threadReplyCounts, setThreadReplyCounts] = useState({});
  const [joinError, setJoinError] = useState("");
  const [authorProfiles, setAuthorProfiles] = useState({});

  // Fetch profile for an email and cache it
  const fetchAuthorProfile = async (email) => {
    if (!email || authorProfiles[email]) return;
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setAuthorProfiles((prev) => ({ ...prev, [email]: data.user }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch author profile:", e);
    }
  };

  // Get display name for an author (use current profile if available)
  const getAuthorDisplayName = (authorEmail, fallbackName) => {
    const profile = authorProfiles[authorEmail];
    return profile?.nickname || profile?.name || fallbackName || "Member";
  };

  // Get avatar for an author (use current profile if available)
  const getAuthorAvatar = (authorEmail, fallbackAvatar) => {
    const profile = authorProfiles[authorEmail];
    return profile?.avatar || fallbackAvatar || "sunrise";
  };

  // Extract language from slug (e.g., "intermediate-chinese" -> "Chinese")
  const getLanguageFromSlug = (s) => {
    if (!s) return "";
    if (s.includes("chinese")) return "Chinese";
    if (s.includes("spanish")) return "Spanish";
    if (s.includes("english")) return "English";
    return "";
  };

  const groupLanguage = getLanguageFromSlug(slug);

  const currentAvatar = profile.avatar || "sunrise";
  const currentName = profile.nickname || session?.user?.name || "Member";
  const isLoggedIn = status === "authenticated";
  const userIsMember = isMember(slug);

  // Fetch group data
  useEffect(() => {
    if (!slug) return;

    const fetchGroup = async () => {
      setLoadingGroup(true);
      try {
        const response = await fetch(`/api/groups?slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
        } else {
          // Use fallback
          const fallback = fallbackGroups[slug] || {
            name: "Language Group",
            level: "Community",
            description: "A focused cohort for debate-driven fluency practice.",
            focus: ["Weekly prompts", "Practice rooms", "Peer feedback"],
            nextEvent: "Upcoming class",
          };
          setGroup({ ...fallback, slug });
        }
      } catch (error) {
        const fallback = fallbackGroups[slug] || {
          name: "Language Group",
          level: "Community",
          description: "A focused cohort for debate-driven fluency practice.",
          focus: ["Weekly prompts", "Practice rooms", "Peer feedback"],
          nextEvent: "Upcoming class",
        };
        setGroup({ ...fallback, slug });
      } finally {
        setLoadingGroup(false);
      }
    };

    fetchGroup();
  }, [slug]);

  // Fetch materials for this group
  useEffect(() => {
    if (!slug) return;

    const fetchMaterials = async () => {
      try {
        const response = await fetch(`/api/materials?groupSlug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.materials || []);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      }
    };

    fetchMaterials();
  }, [slug]);

  // Fetch group members
  useEffect(() => {
    if (!slug) return;

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/memberships?groupSlug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data.memberships || []);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };

    fetchMembers();
  }, [slug]);

  // Fetch threads and their reply counts
  const fetchThreads = async () => {
    if (!slug) return;
    setLoadingThreads(true);
    setError("");
    try {
      const response = await fetch(`/api/threads?groupSlug=${slug}`);
      if (!response.ok) throw new Error("Failed to load threads");
      const data = await response.json();
      const threadList = data.threads || [];
      setThreads(threadList);

      // Fetch reply counts for each thread
      const counts = {};
      await Promise.all(
        threadList.map(async (thread) => {
          try {
            const repliesRes = await fetch(`/api/replies?threadId=${thread.id}&countOnly=true`);
            if (repliesRes.ok) {
              const repliesData = await repliesRes.json();
              counts[thread.id] = repliesData.count || repliesData.replies?.length || 0;
            }
          } catch (e) {
            counts[thread.id] = 0;
          }
        })
      );
      setThreadReplyCounts(counts);

      // Fetch author profiles for all unique emails
      const uniqueEmails = [...new Set(threadList.map((t) => t.authorEmail).filter(Boolean))];
      uniqueEmails.forEach((email) => fetchAuthorProfile(email));
    } catch (err) {
      setError("Unable to load threads.");
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [slug]);

  // Auto-open thread if coming from a direct link
  useEffect(() => {
    if (threadParam && threads.length > 0 && !selectedThread) {
      const thread = threads.find((t) => t.id === threadParam);
      if (thread) {
        handleOpenThread(thread);
        // Clear the query param from URL without reload
        router.replace(`/groups/${slug}`, undefined, { shallow: true });
      }
    }
  }, [threadParam, threads, selectedThread]);

  // Fetch upcoming events filtered by group language
  useEffect(() => {
    if (!groupLanguage) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          // Filter events by language and upcoming date
          const filtered = (data.events || [])
            .filter((event) => {
              const eventDate = event.start ? new Date(event.start) : null;
              const matchesLanguage = event.language?.toLowerCase() === groupLanguage.toLowerCase();
              const isUpcoming = eventDate && eventDate >= now;
              return matchesLanguage && isUpcoming;
            })
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 2);
          setUpcomingEvents(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [groupLanguage]);

  const handleCreateThread = async () => {
    if (!newThread.title.trim()) {
      setError("Thread title is required.");
      return;
    }
    setError("");
    const response = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newThread.title,
        groupSlug: slug,
        authorName: currentName,
        authorEmail: session?.user?.email || "",
        authorAvatar: currentAvatar,
        body: newThread.body,
      }),
    });
    if (!response.ok) {
      setError("Unable to post thread.");
      return;
    }
    setNewThread({ title: "", body: "" });
    fetchThreads();
  };

  // Fetch user RSVPs
  useEffect(() => {
    if (!session?.user?.email) return;

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

  const hasRsvp = (eventId) => rsvps.some((rsvp) => rsvp.eventId === eventId);
  const getRsvpStatus = (eventId) => rsvps.find((r) => r.eventId === eventId)?.status || null;

  const handleSaveEvent = async (event) => {
    if (!session?.user?.email) {
      router.push("/signin");
      return;
    }

    setRsvpLoading(true);
    try {
      const currentStatus = getRsvpStatus(event.id);

      if (currentStatus) {
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
        // Add RSVP
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
            status: "saved",
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
      console.error("Failed to save event:", error);
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatTime = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleDateString();
  };

  // Open thread and fetch replies
  const handleOpenThread = async (thread) => {
    setSelectedThread(thread);
    setLoadingReplies(true);
    setThreadReplies([]);
    setNewReply("");

    // Fetch profile for thread author
    if (thread.authorEmail) {
      fetchAuthorProfile(thread.authorEmail);
    }

    try {
      const response = await fetch(`/api/replies?threadId=${thread.id}`);
      if (response.ok) {
        const data = await response.json();
        const replies = data.replies || [];
        setThreadReplies(replies);
        // Fetch profiles for reply authors
        const uniqueEmails = [...new Set(replies.map((r) => r.authorEmail).filter(Boolean))];
        uniqueEmails.forEach((email) => fetchAuthorProfile(email));
      }
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Post a reply to the selected thread
  const handlePostReply = async () => {
    if (!newReply.trim() || !selectedThread) return;
    if (!session?.user?.email) {
      alert("Please sign in to reply");
      return;
    }

    setPostingReply(true);
    try {
      const response = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThread.id,
          threadTitle: selectedThread.title,
          groupSlug: slug,
          authorName: currentName,
          authorEmail: session.user.email,
          authorAvatar: currentAvatar,
          body: newReply.trim(),
        }),
      });

      if (response.ok) {
        setNewReply("");
        // Refresh replies
        const repliesRes = await fetch(`/api/replies?threadId=${selectedThread.id}`);
        if (repliesRes.ok) {
          const data = await repliesRes.json();
          setThreadReplies(data.replies || []);
        }
      } else {
        alert("Failed to post reply. Please try again.");
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setPostingReply(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!isLoggedIn) {
      router.push("/signin");
      return;
    }
    setJoinLoading(true);
    setJoinError("");
    try {
      if (userIsMember) {
        const result = await leaveGroup(slug);
        if (!result.success) {
          setJoinError(result.error || "Failed to leave group");
        }
      } else {
        // Direct API call for better error handling
        const response = await fetch("/api/memberships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: session.user.email,
            userName: session.user.name || "",
            groupSlug: slug,
            groupName: group?.name || displayGroup.name || "",
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setJoinError(errData.details || errData.error || "Failed to join group. Please check Airtable setup.");
        } else {
          // Refresh memberships and members list
          const membersRes = await fetch(`/api/memberships?groupSlug=${slug}`);
          if (membersRes.ok) {
            const data = await membersRes.json();
            setMembers(data.memberships || []);
          }
          // Trigger membership refresh in hook
          window.location.reload();
        }
      }
    } catch (error) {
      setJoinError("An error occurred. Please try again.");
    }
    setJoinLoading(false);
  };

  if (loadingGroup) {
    return (
      <>
        <Head>
          <title>Mimir Community Center | Loading...</title>
        </Head>
        <div className="grain"></div>
        <header className="site-header compact">
          <NavBar />
        </header>
        <main className="section">
          <p>Loading group...</p>
        </main>
      </>
    );
  }

  const displayGroup = group || fallbackGroups[slug] || {
    name: "Language Group",
    level: "Community",
    description: "A focused cohort for debate-driven fluency practice.",
    focus: ["Weekly prompts", "Practice rooms", "Peer feedback"],
    nextEvent: "Upcoming class",
  };

  return (
    <>
      <Head>
        <title>Mimir Community Center | {displayGroup.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact">
        <NavBar />
        <section className="detail-hero">
          <div>
            <p className="eyebrow">{displayGroup.level} track</p>
            <h1>{displayGroup.name}</h1>
            <p className="lead">{displayGroup.description}</p>
          </div>
        </section>
      </header>

      <main className="section detail-layout">
        <div className="detail-main">
          <section className="detail-section">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Upcoming lessons</p>
                <h2>Next up</h2>
              </div>
              <Link className="cta ghost small" href="/calendar">
                View schedule
              </Link>
            </div>
            <div className="detail-cards">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <article
                    key={event.id}
                    className="detail-card clickable"
                    onClick={() => setSelectedEvent(event)}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="label">{index === 0 ? "Next" : "Coming soon"}</p>
                    <h3>
                      {event.start
                        ? new Date(event.start).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}{" "}
                      · {event.title}
                    </h3>
                    <p>{event.type || "Live session"} · {event.location || "Online"}</p>
                    {hasRsvp(event.id) && <span className="saved-badge">Saved ✓</span>}
                  </article>
                ))
              ) : (
                <>
                  <article className="detail-card">
                    <p className="label">Next</p>
                    <h3>To be announced</h3>
                    <p>Check the calendar for upcoming {groupLanguage} events</p>
                  </article>
                  <article className="detail-card">
                    <p className="label">Coming soon</p>
                    <h3>Seasonal topic workshop</h3>
                    <p>Live session · Online</p>
                  </article>
                </>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Materials</p>
                <h2>Watch &amp; read</h2>
              </div>
              <button className="cta ghost small" type="button" onClick={() => setShowMaterialsModal(true)}>
                Check more materials
              </button>
            </div>
            <div className="materials-grid">
              <div className="materials-column">
                <h3>Watch</h3>
                <ul className="detail-list">
                  {materials.filter((item) => item.type === "video").slice(0, 4).map((material) => (
                    <li key={material.id}>
                      {material.fileUrl ? (
                        <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                          {material.title}
                        </a>
                      ) : (
                        material.title
                      )}
                    </li>
                  ))}
                  {materials.filter((item) => item.type === "video").length === 0 && (
                    <>
                      <li>Weekly highlight reel</li>
                      <li>Season topic overview</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="materials-column">
                <h3>Read</h3>
                <ul className="detail-list">
                  {materials
                    .filter((item) => item.type !== "video")
                    .slice(0, 4)
                    .map((material) => (
                      <li key={material.id}>
                        {material.fileUrl ? (
                          <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                            {material.title}
                          </a>
                        ) : (
                          material.title
                        )}
                      </li>
                    ))}
                  {materials.filter((item) => item.type !== "video").length === 0 && (
                    <>
                      <li>Debate motion outline</li>
                      <li>Vocabulary mini deck</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Discussion</p>
                <h2>Topics &amp; Replies</h2>
              </div>
              <button className="cta ghost small" type="button" onClick={() => setShowTopicsModal(true)}>
                Check out topics
              </button>
              {isLoggedIn && (
                <button className="cta small" type="button" onClick={handleCreateThread}>
                  New topic
                </button>
              )}
            </div>
            {isLoggedIn && (
              <div className="thread-editor">
                <input
                  type="text"
                  placeholder="Topic title"
                  value={newThread.title}
                  onChange={(event) => setNewThread({ ...newThread, title: event.target.value })}
                />
                <textarea
                  rows={3}
                  placeholder="Add a quick prompt..."
                  value={newThread.body}
                  onChange={(event) => setNewThread({ ...newThread, body: event.target.value })}
                />
                <button
                  className="thread-post-btn"
                  type="button"
                  onClick={handleCreateThread}
                  disabled={!newThread.title.trim()}
                >
                  Post Topic
                </button>
              </div>
            )}
            {error && <p className="label">{error}</p>}
            {loadingThreads && <p className="label">Loading topics...</p>}
            <div className="thread-list">
              {threads.length === 0 && !loadingThreads && (
                <p className="label">No topics yet. Be the first to start one.</p>
              )}
              {threads.map((thread) => {
                // Calculate badge for thread author (simplified - assumes newcomer for demo)
                const authorBadge = getBadgeLevel(0); // Default to newcomer
                const replyCount = threadReplyCounts[thread.id] || 0;
                return (
                  <div
                    key={thread.id}
                    className="thread-item clickable"
                    onClick={() => handleOpenThread(thread)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="thread-avatar-badge">
                      <span
                        className="thread-badge-icon"
                        title={`${authorBadge.name} - Level ${authorBadge.level}`}
                        style={{
                          background: `linear-gradient(135deg, ${authorBadge.gradientStart} 0%, ${authorBadge.gradientEnd} 100%)`,
                        }}
                      >
                        {authorBadge.emoji}
                      </span>
                    </div>
                    <div className="thread-content">
                      <h3>{thread.title}</h3>
                      <p className="thread-meta">
                        <span className="thread-author-name">{getAuthorDisplayName(thread.authorEmail, thread.authorName)}</span>
                        <span className="thread-meta-dot">·</span>
                        {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : "Just now"}
                      </p>
                      <p className="thread-preview">{thread.body || "Click to open and reply"}</p>
                    </div>
                    <div className="thread-stats">
                      <span className="thread-reply-count">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        {replyCount}
                      </span>
                      <span className="thread-arrow">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Group snapshot</h3>
            <div className="stat-grid two">
              <div>
                <p className="label">Members</p>
                <p className="value">{members.length || 0}</p>
              </div>
              <div>
                <p className="label">Topics</p>
                <p className="value">{threads.length || 0}</p>
              </div>
            </div>
            <div className="tag-stack">
              {(displayGroup.focus || []).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <button
              className={`cta wide ${userIsMember ? "joined" : ""}`}
              type="button"
              onClick={handleJoinLeave}
              disabled={joinLoading}
            >
              {joinLoading
                ? "..."
                : userIsMember
                ? "Joined ✓"
                : "Join this group"}
            </button>
            {joinError && <p className="join-error">{joinError}</p>}
            {userIsMember && (
              <button
                className="cta ghost wide leave-btn"
                type="button"
                onClick={handleJoinLeave}
                disabled={joinLoading}
              >
                Leave group
              </button>
            )}
          </div>

          <div className="side-card">
            <h3>Group reminders</h3>
            <ul className="detail-list">
              <li>Weekly lesson sign-ups open Mondays.</li>
              <li>Share one prompt before Friday.</li>
              <li>Mini-debate rooms open weekends.</li>
            </ul>
            <Link className="cta ghost" href="/announcements">
              See all reminders
            </Link>
          </div>

        </aside>
      </main>

      {/* Event Modal */}
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
              <p className="minimal-label">{selectedEvent.type || "Event"}</p>
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
                Join Meeting
              </a>
            )}
            <div className="event-actions">
              {isLoggedIn ? (
                <button
                  className="event-btn primary"
                  type="button"
                  onClick={() => handleSaveEvent(selectedEvent)}
                  disabled={rsvpLoading}
                >
                  {hasRsvp(selectedEvent.id) ? "Saved ✓" : "Save event"}
                </button>
              ) : (
                <Link className="event-btn primary" href="/signin">
                  Sign in to save
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topics Modal */}
      {showTopicsModal && (
        <div className="event-overlay" onClick={() => setShowTopicsModal(false)}>
          <div className="event-modal-box modal-large" onClick={(e) => e.stopPropagation()}>
            <button
              className="event-close"
              type="button"
              onClick={() => setShowTopicsModal(false)}
            >
              ×
            </button>
            <div className="event-modal-header">
              <p className="minimal-label">Discussion</p>
            </div>
            <h2>All Topics</h2>
            <p className="modal-subtitle">{threads.length} topic{threads.length !== 1 ? "s" : ""} in this group</p>
            <div className="modal-list">
              {threads.length === 0 ? (
                <p className="modal-empty">No topics yet. Be the first to start a discussion!</p>
              ) : (
                threads.map((thread) => (
                  <div key={thread.id} className="modal-list-item">
                    <img
                      className="thread-avatar"
                      src={`/avatars/${getAuthorAvatar(thread.authorEmail, thread.authorAvatar)}.svg`}
                      alt={`${getAuthorDisplayName(thread.authorEmail, thread.authorName)} avatar`}
                    />
                    <div className="modal-item-content">
                      <h3>{thread.title}</h3>
                      <p className="modal-item-meta">
                        {getAuthorDisplayName(thread.authorEmail, thread.authorName)} · {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : "Just now"}
                      </p>
                      {thread.body && <p className="modal-item-preview">{thread.body}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Materials Modal */}
      {showMaterialsModal && (
        <div className="event-overlay" onClick={() => setShowMaterialsModal(false)}>
          <div className="event-modal-box modal-large" onClick={(e) => e.stopPropagation()}>
            <button
              className="event-close"
              type="button"
              onClick={() => setShowMaterialsModal(false)}
            >
              ×
            </button>
            <div className="event-modal-header">
              <p className="minimal-label">Materials</p>
            </div>
            <h2>All Materials</h2>
            <p className="modal-subtitle">{materials.length} material{materials.length !== 1 ? "s" : ""} available</p>
            <div className="modal-materials-grid">
              <div className="modal-materials-column">
                <h3>Watch</h3>
                <ul className="modal-materials-list">
                  {materials.filter((m) => m.type === "video").length === 0 ? (
                    <li className="modal-empty-item">No videos available yet</li>
                  ) : (
                    materials.filter((m) => m.type === "video").map((material) => (
                      <li key={material.id}>
                        {material.fileUrl ? (
                          <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                            {material.title}
                          </a>
                        ) : (
                          <span>{material.title}</span>
                        )}
                        {material.description && <p className="material-desc">{material.description}</p>}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="modal-materials-column">
                <h3>Read</h3>
                <ul className="modal-materials-list">
                  {materials.filter((m) => m.type !== "video").length === 0 ? (
                    <li className="modal-empty-item">No reading materials available yet</li>
                  ) : (
                    materials.filter((m) => m.type !== "video").map((material) => (
                      <li key={material.id}>
                        {material.fileUrl ? (
                          <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                            {material.title}
                          </a>
                        ) : (
                          <span>{material.title}</span>
                        )}
                        {material.description && <p className="material-desc">{material.description}</p>}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <Link href="/competitions" className="cta ghost">
                Browse all materials
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Thread Detail Modal */}
      {selectedThread && (
        <div className="event-overlay" onClick={() => setSelectedThread(null)}>
          <div className="event-modal-box modal-large thread-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="event-close"
              type="button"
              onClick={() => setSelectedThread(null)}
            >
              ×
            </button>
            <div className="thread-modal-header">
              <img
                className="thread-author-avatar"
                src={`/avatars/${getAuthorAvatar(selectedThread.authorEmail, selectedThread.authorAvatar)}.svg`}
                alt={`${getAuthorDisplayName(selectedThread.authorEmail, selectedThread.authorName)} avatar`}
              />
              <div>
                <p className="thread-author-name">{getAuthorDisplayName(selectedThread.authorEmail, selectedThread.authorName)}</p>
                <p className="thread-date">
                  {selectedThread.createdAt
                    ? new Date(selectedThread.createdAt).toLocaleDateString()
                    : "Just now"}
                </p>
              </div>
            </div>
            <h2 className="thread-modal-title">{selectedThread.title}</h2>
            {selectedThread.body && (
              <p className="thread-modal-body">{selectedThread.body}</p>
            )}

            <div className="thread-replies-section">
              <h3 className="replies-heading">
                {threadReplies.length} {threadReplies.length === 1 ? "Reply" : "Replies"}
              </h3>

              {loadingReplies ? (
                <p className="loading-text">Loading replies...</p>
              ) : threadReplies.length === 0 ? (
                <p className="no-replies">No replies yet. Be the first to respond!</p>
              ) : (
                <div className="replies-list">
                  {threadReplies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <img
                        className="reply-avatar"
                        src={`/avatars/${getAuthorAvatar(reply.authorEmail, reply.authorAvatar)}.svg`}
                        alt={`${getAuthorDisplayName(reply.authorEmail, reply.authorName)} avatar`}
                      />
                      <div className="reply-content">
                        <div className="reply-header">
                          <span className="reply-author">{getAuthorDisplayName(reply.authorEmail, reply.authorName)}</span>
                          <span className="reply-date">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleDateString()
                              : "Just now"}
                          </span>
                        </div>
                        <p className="reply-body">{reply.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isLoggedIn ? (
                <div className="reply-form">
                  <img
                    className="reply-avatar"
                    src={`/avatars/${currentAvatar}.svg`}
                    alt="Your avatar"
                  />
                  <div className="reply-input-wrapper">
                    <textarea
                      className="reply-input"
                      placeholder="Write a reply..."
                      rows={3}
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                    />
                    <button
                      className="reply-submit-btn"
                      onClick={handlePostReply}
                      disabled={!newReply.trim() || postingReply}
                    >
                      {postingReply ? "Posting..." : "Post Reply"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="reply-signin-prompt">
                  <p>Sign in to reply to this discussion</p>
                  <Link href="/signin" className="cta small">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
