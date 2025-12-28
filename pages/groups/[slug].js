import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import { useProfile } from "../../components/useProfile";

const groups = {
  "intermediate-chinese": {
    name: "Intermediate Chinese",
    level: "Intermediate",
    description:
      "Build fluency by turning news clips, essays, and debate motions into speaking practice.",
    members: "420",
    online: "18",
    admins: "4",
    focus: ["Weekly clinics", "Speaking pods", "Structured feedback"],
    nextEvent: "May 10 · Debate structure essentials",
  },
  "advanced-chinese": {
    name: "Advanced Chinese",
    level: "Advanced",
    description:
      "Sharpen nuance, rhetorical structure, and advanced vocabulary for competitive rounds.",
    members: "260",
    online: "12",
    admins: "3",
    focus: ["High-level discourse", "Judge reviews", "Rebuttal drills"],
    nextEvent: "May 12 · Rebuttal toolkit",
  },
  "intermediate-spanish": {
    name: "Intermediate Spanish",
    level: "Intermediate",
    description:
      "Practice arguments that combine cultural context and real-world themes.",
    members: "310",
    online: "15",
    admins: "3",
    focus: ["Conversation ladders", "Media watchlists", "Weekly prompts"],
    nextEvent: "May 08 · Ethics of AI in education",
  },
  "advanced-spanish": {
    name: "Advanced Spanish",
    level: "Advanced",
    description:
      "Refine persuasive speaking with high-impact, rapid rebuttal drills.",
    members: "190",
    online: "9",
    admins: "2",
    focus: ["Expert mentor hours", "Style workshops", "Cross-track debates"],
    nextEvent: "May 14 · Advanced rebuttal lab",
  },
  "intermediate-english": {
    name: "Intermediate English",
    level: "Intermediate",
    description:
      "Go beyond basics with guided speaking prompts and debate structures.",
    members: "520",
    online: "22",
    admins: "5",
    focus: ["Discussion circles", "Vocabulary labs", "Peer reviews"],
    nextEvent: "May 06 · Opening statements clinic",
  },
  "advanced-english": {
    name: "Advanced English",
    level: "Advanced",
    description:
      "Elevate tone, precision, and confidence for international rounds.",
    members: "280",
    online: "14",
    admins: "3",
    focus: ["Live critiques", "Argument polish", "Competition prep"],
    nextEvent: "May 16 · Finals rehearsal",
  },
};

export default function GroupDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { profile } = useProfile();
  const group = groups[slug] || {
    name: "Language Group",
    level: "Community",
    description: "A focused cohort for debate-driven fluency practice.",
    members: "--",
    online: "--",
    admins: "--",
    focus: ["Weekly prompts", "Practice rooms", "Peer feedback"],
    nextEvent: "Upcoming class",
  };
  const currentAvatar = profile.avatar || "sunrise";
  const threadSamples = [
    {
      id: "t1",
      title: "How do you build stronger rebuttals?",
      author: "Ariana Chen",
      avatar: "berry",
      time: "2h ago",
      replies: 6,
      preview: "I keep freezing in rebuttals. Any drills you recommend?",
    },
    {
      id: "t2",
      title: "Debate motion: AI in education",
      author: "Luis Ortega",
      avatar: "mint",
      time: "5h ago",
      replies: 4,
      preview: "Let’s share resources that cover both sides of the motion.",
    },
    {
      id: "t3",
      title: "Vocabulary list for next week",
      author: "Mei Tan",
      avatar: "plum",
      time: "1d ago",
      replies: 9,
      preview: "I drafted a list — want to collaborate on examples?",
    },
  ];
  const commentSamples = [
    {
      id: "c1",
      author: "Jordan Lee",
      avatar: "ember",
      time: "10 min ago",
      text: "I like the three-part structure: claim, evidence, impact. Works well in rebuttal.",
    },
    {
      id: "c2",
      author: "Mina Sol",
      avatar: "sunrise",
      time: "1h ago",
      text: "Try speed drills: 30 seconds to answer a prompt, 10 seconds to reset.",
    },
  ];

  return (
    <>
      <Head>
        <title>Mimir Community Center | {group.name}</title>
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
            <p className="eyebrow">{group.level} track</p>
            <h1>{group.name}</h1>
            <p className="lead">{group.description}</p>
            <div className="detail-actions">
              <Link className="cta" href="/signin">
                Join group
              </Link>
              <Link className="cta ghost" href="/calendar">
                View schedule
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main className="section detail-layout">
        <div className="detail-main">
          <div className="detail-media">
            <div className="media-placeholder">
              <span>Group intro + weekly highlights</span>
            </div>
            <div className="media-thumbs">
              <div className="thumb">Prompt deck</div>
              <div className="thumb">Speaking drill</div>
              <div className="thumb">Reading pack</div>
              <div className="thumb">Debate room</div>
            </div>
          </div>

          <section className="detail-section">
            <h2>What you will do each week</h2>
            <ul className="detail-list">
              <li>Join a 60-minute live discussion with cohort partners.</li>
              <li>Share watch-read-speak materials with peers and mentors.</li>
              <li>Practice structured rebuttals using seasonal debate topics.</li>
            </ul>
          </section>

          <section className="detail-section">
            <h2>Upcoming group sessions</h2>
            <div className="detail-cards">
              <article className="detail-card">
                <p className="label">Next up</p>
                <h3>{group.nextEvent}</h3>
                <p>Live session · 60 mins · Online</p>
                <Link className="cta small" href="/calendar/debate-structure-essentials">
                  See details
                </Link>
              </article>
              <article className="detail-card">
                <p className="label">Community practice</p>
                <h3>Peer speaking pods</h3>
                <p>Small group drills · 45 mins</p>
                <Link className="cta small" href="/calendar/opening-statements-clinic">
                  Book a seat
                </Link>
              </article>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Group discussion</p>
                <h2>Threads</h2>
              </div>
              <Link className="cta small" href="/signin">
                Start a thread
              </Link>
            </div>
            <div className="thread-list">
              {threadSamples.map((thread) => (
                <div key={thread.id} className="thread-item">
                  <img
                    className="thread-avatar"
                    src={`/avatars/${thread.avatar}.svg`}
                    alt={`${thread.author} avatar`}
                  />
                  <div>
                    <h3>{thread.title}</h3>
                    <p className="thread-meta">
                      {thread.author} · {thread.time} · {thread.replies} replies
                    </p>
                    <p className="thread-preview">{thread.preview}</p>
                  </div>
                  <button className="cta ghost small" type="button">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Thread sample</p>
                <h2>Comments</h2>
              </div>
            </div>
            <div className="comment-box">
              <img
                className="comment-avatar"
                src={`/avatars/${currentAvatar}.svg`}
                alt="Your avatar"
              />
              <div className="comment-input">
                <p className="label">Reply as {profile.nickname || "Member"}</p>
                <textarea rows={3} placeholder="Share your insight..." />
                <button className="cta small" type="button">
                  Post reply
                </button>
              </div>
            </div>
            <div className="comment-list">
              {commentSamples.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <img
                    className="comment-avatar"
                    src={`/avatars/${comment.avatar}.svg`}
                    alt={`${comment.author} avatar`}
                  />
                  <div>
                    <p className="thread-meta">
                      {comment.author} · {comment.time}
                    </p>
                    <p className="thread-preview">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Group snapshot</h3>
            <div className="stat-grid">
              <div>
                <p className="label">Members</p>
                <p className="value">{group.members}</p>
              </div>
              <div>
                <p className="label">Online now</p>
                <p className="value">{group.online}</p>
              </div>
              <div>
                <p className="label">Admins</p>
                <p className="value">{group.admins}</p>
              </div>
            </div>
            <div className="tag-stack">
              {group.focus.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <Link className="cta" href="/signin">
              Join this group
            </Link>
          </div>

          <div className="side-card">
            <h3>Materials shared</h3>
            <ul className="detail-list">
              <li>Debate motion outline</li>
              <li>Vocabulary mini deck</li>
              <li>Sample opening statements</li>
            </ul>
            <Link className="cta ghost" href="/announcements">
              See announcements
            </Link>
          </div>
        </aside>
      </main>
    </>
  );
}
