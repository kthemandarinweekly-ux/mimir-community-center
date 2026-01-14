import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NavBar from "../../components/NavBar";
import { useProfile } from "../../components/useProfile";
import { useMemberships } from "../../components/useMemberships";

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
  const { slug } = router.query;
  const { data: session, status } = useSession();
  const { profile } = useProfile();
  const { isMember, joinGroup, leaveGroup } = useMemberships();

  const [group, setGroup] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [members, setMembers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", body: "" });
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

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

  // Fetch threads
  const fetchThreads = async () => {
    if (!slug) return;
    setLoadingThreads(true);
    setError("");
    try {
      const response = await fetch(`/api/threads?groupSlug=${slug}`);
      if (!response.ok) throw new Error("Failed to load threads");
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      setError("Unable to load threads.");
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [slug]);

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


  const handleJoinLeave = async () => {
    if (!isLoggedIn) {
      router.push("/signin");
      return;
    }
    setJoinLoading(true);
    if (userIsMember) {
      await leaveGroup(slug);
    } else {
      await joinGroup(slug, group?.name || "");
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
              <article className="detail-card">
                <p className="label">This week</p>
                <h3>{displayGroup.nextEvent}</h3>
                <p>Live session · 60 mins · Online</p>
              </article>
              <article className="detail-card">
                <p className="label">Coming soon</p>
                <h3>Seasonal topic workshop</h3>
                <p>Live session · 60 mins · Online</p>
              </article>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Materials</p>
                <h2>Watch &amp; read</h2>
              </div>
              <Link className="cta ghost small" href="/competitions">
                Check more materials
              </Link>
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
              <button className="cta ghost small" type="button">
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
              </div>
            )}
            {error && <p className="label">{error}</p>}
            {loadingThreads && <p className="label">Loading topics...</p>}
            <div className="thread-list">
              {threads.length === 0 && !loadingThreads && (
                <p className="label">No topics yet. Be the first to start one.</p>
              )}
              {threads.map((thread) => (
                <div key={thread.id} className="thread-item">
                  <img
                    className="thread-avatar"
                    src={`/avatars/${thread.authorAvatar}.svg`}
                    alt={`${thread.authorName} avatar`}
                  />
                  <div>
                    <h3>{thread.title}</h3>
                    <p className="thread-meta">
                      {thread.authorName} ·{" "}
                      {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : "Just now"}
                    </p>
                    <p className="thread-preview">{thread.body || "Open the thread to reply."}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Group snapshot</h3>
            <div className="stat-grid two">
              <div>
                <p className="label">Members</p>
                <p className="value">{members.length || displayGroup.memberCount || "--"}</p>
              </div>
              <div>
                <p className="label">Online now</p>
                <p className="value">{displayGroup.onlineCount || "--"}</p>
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
    </>
  );
}
