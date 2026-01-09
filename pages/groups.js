import Head from "next/head";
import Link from "next/link";
import LevelPlacementModal from "../components/LevelPlacementModal";

const groups = [
  {
    slug: "intermediate-english",
    name: "Intermediate English",
    level: "Intermediate",
    language: "English",
    description: "Strengthen daily fluency and clear explanations with guided prompts.",
  },
  {
    slug: "advanced-english",
    name: "Advanced English",
    level: "Advanced",
    language: "English",
    description: "Sharpen nuance, tone, and persuasive speaking for complex topics.",
  },
  {
    slug: "intermediate-spanish",
    name: "Intermediate Spanish",
    level: "Intermediate",
    language: "Spanish",
    description: "Build confidence through real conversations and structured practice.",
  },
  {
    slug: "advanced-spanish",
    name: "Advanced Spanish",
    level: "Advanced",
    language: "Spanish",
    description: "Develop fast rebuttals, richer vocabulary, and confident expression.",
  },
  {
    slug: "intermediate-chinese",
    name: "Intermediate Chinese",
    level: "Intermediate",
    language: "Chinese",
    description: "Practice clear opinions and everyday discussion in Mandarin.",
  },
  {
    slug: "advanced-chinese",
    name: "Advanced Chinese",
    level: "Advanced",
    language: "Chinese",
    description: "Refine structure, rhetoric, and precision for deeper debates.",
  },
];

export default function GroupsPage() {
  return (
    <>
      <Head>
        <title>Groups | The Mimir Language Community</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="groups-page">
        <header className="groups-hero">
          <div className="groups-top">
            <Link className="groups-brand" href="/">
              The Mimir Language Community
            </Link>
            <nav className="groups-links">
              <Link href="/competitions">Debate</Link>
              <Link href="/groups">Groups</Link>
              <Link href="/calendar">Calendar</Link>
              <Link href="/announcements">Announcements</Link>
            </nav>
          </div>
          <div className="groups-hero-inner">
            <p className="landing-eyebrow">Groups</p>
            <h1 className="groups-title">Join a group that fits you.</h1>
          </div>
        </header>

        <main className="groups-content">
          <section className="groups-benefits">
            <h2>What you will do each week</h2>
            <ul>
              <li>Join a free weekly lesson with a Mimir teacher focused on the seasonal topic.</li>
              <li>Receive curated watching and reading materials from professional mentors.</li>
              <li>Discuss debate-topic arguments with global peers and arrange mini debates.</li>
              <li>Prepare together before the final seasonal competition.</li>
            </ul>
          </section>

          <div className="groups-cta-row">
            <Link className="groups-inline-cta" href="#level-quiz" data-mimir-level-button="true">
              Which level should I choose?
            </Link>
          </div>

          <div className="groups-grid">
            {groups.map((group) => (
              <article key={group.name} className="groups-card">
                <div>
                  <p className="groups-tag">{group.level}</p>
                  <h2>{group.name}</h2>
                  <p>{group.description}</p>
                </div>
                <div className="groups-card-meta">
                  <span>{group.language}</span>
                  <Link className="groups-cta" href={`/groups/${group.slug}`}>
                    View group
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </main>

      </div>
      <LevelPlacementModal />
    </>
  );
}
