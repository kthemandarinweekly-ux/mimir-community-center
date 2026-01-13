import Head from "next/head";
import Link from "next/link";
import LevelPlacementModal from "../components/LevelPlacementModal";
import MinimalNav from "../components/MinimalNav";

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
        <title>Groups | Open Debate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="minimal-page">
        <MinimalNav />

        <main className="minimal-content">
          <section className="minimal-hero">
            <p className="minimal-label">Find Your Group</p>
            <h1 className="minimal-title">Join a group that fits you</h1>
            <p className="minimal-subtitle">
              Choose your target language and level. Start learning with peers worldwide.
            </p>
          </section>

          <section className="minimal-section">
            <div className="minimal-benefits">
              <article className="minimal-benefit">
                <h3>Weekly Live Sessions</h3>
                <p>Free lessons with teachers focused on the seasonal topic.</p>
              </article>
              <article className="minimal-benefit">
                <h3>Curated Materials</h3>
                <p>Videos, readings, and vocabulary from professional mentors.</p>
              </article>
              <article className="minimal-benefit">
                <h3>Global Community</h3>
                <p>Discuss and practice arguments with peers around the world.</p>
              </article>
            </div>
          </section>

          <section className="minimal-section">
            <div className="minimal-section-header">
              <h2>Choose Your Group</h2>
              <button className="minimal-text-btn" data-mimir-level-button="true">
                Which level should I choose?
              </button>
            </div>

            <div className="minimal-grid">
              {groups.map((group) => (
                <Link
                  key={group.slug}
                  href={`/groups/${group.slug}`}
                  className="minimal-card"
                >
                  <div className="minimal-card-top">
                    <span className="minimal-tag">{group.language}</span>
                    <span className="minimal-level">{group.level}</span>
                  </div>
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
      <LevelPlacementModal />
    </>
  );
}
