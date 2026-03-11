import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import MinimalNav from "../components/MinimalNav";
import { getCurrentSeason, seasons } from "../data/seasons";

export default function DebatePage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const currentSeason = getCurrentSeason();
  const otherSeasons = seasons.filter((season) => season.id !== currentSeason.id);

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
            <p className="debate-main-desc">{currentSeason.timeline}</p>
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
                <p>Join free debate classes</p>
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

          {/* Other Seasons */}
          <section className="debate-seasons-section">
            <h2>Season Archive & Upcoming</h2>
            <div className="seasons-grid">
              {otherSeasons.map((season) => (
                <article key={season.id} className="season-card upcoming">
                  <span className="season-label">{season.label}</span>
                  <p>{season.timeline}</p>
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
