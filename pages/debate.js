import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import MinimalNav from "../components/MinimalNav";

const seasons = [
  {
    id: "2026-1",
    label: "2026 Season 1",
    active: true,
    topic: "Should AI tools be used in schools?",
    description: "As artificial intelligence reshapes education worldwide, this debate explores the balance between technological innovation and traditional learning methods.",
    why: {
      intro: "This topic matters because AI is rapidly transforming how students learn, teachers teach, and schools operate. The decisions we make today will shape education for generations.",
      chinese: {
        title: "为什么这个话题很重要",
        points: [
          "中国正在大力推进教育数字化转型，AI工具在课堂中的应用日益普及",
          "学生需要培养批判性思维，辨别AI生成内容与人类创作的区别",
          "教育公平问题：城乡之间的AI资源差距可能扩大教育不平等"
        ]
      },
      spanish: {
        title: "¿Por qué es importante este tema?",
        points: [
          "América Latina enfrenta desafíos únicos en la adopción de tecnología educativa",
          "El debate sobre la dependencia tecnológica vs. el pensamiento crítico es esencial",
          "Las comunidades hispanohablantes buscan equilibrar tradición e innovación en la educación"
        ]
      },
      english: {
        title: "Why This Topic Matters",
        points: [
          "Schools worldwide are adopting AI tools at unprecedented rates without clear guidelines",
          "Students must learn to use AI responsibly while developing authentic skills",
          "The future workforce will require both AI literacy and uniquely human capabilities"
        ]
      }
    },
    languages: ["Chinese", "Spanish", "English"],
    materialLinks: {
      chinese: "/competitions#chinese",
      spanish: "/competitions#spanish",
      english: "/competitions#english"
    },
    relatedGroups: [
      { slug: "intermediate-chinese", name: "Intermediate Chinese" },
      { slug: "advanced-chinese", name: "Advanced Chinese" },
      { slug: "intermediate-spanish", name: "Intermediate Spanish" },
      { slug: "advanced-spanish", name: "Advanced Spanish" },
      { slug: "intermediate-english", name: "Intermediate English" },
      { slug: "advanced-english", name: "Advanced English" },
    ]
  },
  {
    id: "2026-2",
    label: "2026 Season 2",
    active: false,
    topic: "Coming Soon",
    description: "Stay tuned for the next debate topic. Join the community to be notified when it's announced."
  },
  {
    id: "2026-3",
    label: "2026 Season 3",
    active: false,
    topic: "Coming Soon",
    description: "Future debate topic will be announced. Subscribe to updates."
  },
  {
    id: "2026-4",
    label: "2026 Season 4",
    active: false,
    topic: "Coming Soon",
    description: "Future debate topic will be announced. Subscribe to updates."
  }
];

export default function DebatePage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const currentSeason = seasons[0];

  return (
    <>
      <Head>
        <title>Debate | Mimir Language Community</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="debate-page">
        <MinimalNav />

        <main className="debate-content">
          {/* Hero Section */}
          <section className="debate-hero-section">
            <span className="debate-season-badge">{currentSeason.label}</span>
            <h1 className="debate-main-title">{currentSeason.topic}</h1>
            <p className="debate-main-desc">{currentSeason.description}</p>
          </section>

          {/* Why This Topic Section */}
          <section className="debate-why-section">
            <h2>Why Debate This Topic?</h2>
            <p className="debate-why-intro">{currentSeason.why.intro}</p>

            <div className="debate-language-cards">
              {/* Chinese Card */}
              <article className="language-card chinese">
                <div className="language-card-header">
                  <span className="language-flag">🇨🇳</span>
                  <h3>{currentSeason.why.chinese.title}</h3>
                </div>
                <ul>
                  {currentSeason.why.chinese.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
                <Link href={currentSeason.materialLinks.chinese} className="language-card-link">
                  View Chinese Materials →
                </Link>
              </article>

              {/* Spanish Card */}
              <article className="language-card spanish">
                <div className="language-card-header">
                  <span className="language-flag">🇪🇸</span>
                  <h3>{currentSeason.why.spanish.title}</h3>
                </div>
                <ul>
                  {currentSeason.why.spanish.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
                <Link href={currentSeason.materialLinks.spanish} className="language-card-link">
                  View Spanish Materials →
                </Link>
              </article>

              {/* English Card */}
              <article className="language-card english">
                <div className="language-card-header">
                  <span className="language-flag">🇺🇸</span>
                  <h3>{currentSeason.why.english.title}</h3>
                </div>
                <ul>
                  {currentSeason.why.english.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
                <Link href={currentSeason.materialLinks.english} className="language-card-link">
                  View English Materials →
                </Link>
              </article>
            </div>
          </section>

          {/* Quick Links Section */}
          <section className="debate-quick-section">
            <h2>Quick Links</h2>
            <div className="quick-link-grid">
              <Link href="/competitions" className="quick-link-card materials">
                <span className="quick-icon">📚</span>
                <h3>All Materials</h3>
                <p>Videos, readings, and vocabulary for all languages</p>
              </Link>
              <Link href="/calendar" className="quick-link-card calendar">
                <span className="quick-icon">📅</span>
                <h3>Live Sessions</h3>
                <p>Join free weekly debate classes</p>
              </Link>
              <Link href="/groups" className="quick-link-card groups">
                <span className="quick-icon">👥</span>
                <h3>Practice Groups</h3>
                <p>Find partners at your level</p>
              </Link>
            </div>
          </section>

          {/* Related Groups Section */}
          <section className="debate-groups-section">
            <h2>Join a Group</h2>
            <p className="debate-groups-desc">Choose your target language and level to start practicing.</p>
            <div className="debate-groups-grid">
              {currentSeason.relatedGroups.map((group) => (
                <Link key={group.slug} href={`/groups/${group.slug}`} className="debate-group-card">
                  {group.name}
                  <span className="group-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Upcoming Seasons */}
          <section className="debate-seasons-section">
            <h2>Upcoming Seasons</h2>
            <div className="seasons-grid">
              {seasons.slice(1).map((season) => (
                <article key={season.id} className="season-card upcoming">
                  <span className="season-label">{season.label}</span>
                  <h3>{season.topic}</h3>
                  <p>{season.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="debate-cta-section">
            <h2>Ready to join the debate?</h2>
            <p>Practice your target language through meaningful discussions.</p>
            {isLoggedIn ? (
              <Link href="/groups" className="debate-cta-btn">
                Find Your Group
              </Link>
            ) : (
              <Link href="/signin" className="debate-cta-btn">
                Get Started Free
              </Link>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
