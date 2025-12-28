import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";

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
