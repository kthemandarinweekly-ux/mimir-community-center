import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import MinimalNav from "../components/MinimalNav";

export default function Home() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <>
      <Head>
        <title>Mimir Language Community</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Hero Section - Colorful and Welcoming */}
      <div className="home-hero">
        <MinimalNav />

        <main className="home-hero-content">
          <div className="home-hero-badge">🌟 Free to join</div>
          <h1 className="home-title">
            Learn languages through <span className="home-highlight">debate</span>
          </h1>
          <p className="home-tagline">
            Join a global community. Discuss real topics. Build real fluency.
          </p>

          <div className="home-hero-actions">
            {isLoggedIn ? (
              <Link className="home-cta-primary" href="/account">
                Go to My Dashboard →
              </Link>
            ) : (
              <>
                <Link className="home-cta-primary" href="/signin">
                  Start Learning Free →
                </Link>
                <Link className="home-cta-secondary" href="/groups">
                  Explore Groups
                </Link>
              </>
            )}
          </div>

          <div className="home-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-icon">🌍</span>
              <span className="hero-stat-text">3 Languages</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">👥</span>
              <span className="hero-stat-text">Global Community</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">🎓</span>
              <span className="hero-stat-text">Free Classes</span>
            </div>
          </div>
        </main>

        <div className="home-hero-illustration">
          <div className="floating-card card-1">🇨🇳</div>
          <div className="floating-card card-2">🇪🇸</div>
          <div className="floating-card card-3">🇬🇧</div>
        </div>
      </div>

      {/* Season Topic Section - Colorful Banner */}
      <section className="home-topic-banner">
        <div className="topic-banner-content">
          <span className="topic-badge">🔥 Season 1 Topic</span>
          <h2 className="topic-title">Should AI tools be used in schools?</h2>
          <p className="topic-desc">
            One topic. Three languages. A global community debating together.
          </p>
          <div className="topic-languages">
            <span className="lang-pill chinese">Chinese</span>
            <span className="lang-pill spanish">Spanish</span>
            <span className="lang-pill english">English</span>
          </div>
          <Link href="/debate" className="topic-link">
            Explore this topic →
          </Link>
        </div>
      </section>

      {/* How It Works - Colorful Steps */}
      <section className="home-section home-steps-section">
        <h2 className="home-section-title">Your journey to fluency</h2>
        <p className="home-section-subtitle">Four simple steps to start speaking with confidence</p>

        <div className="home-steps">
          <article className="home-step step-pink">
            <div className="step-number">1</div>
            <div className="step-icon">👥</div>
            <h3>Join a Group</h3>
            <p>Pick your language and level. Connect with learners worldwide.</p>
          </article>

          <article className="home-step step-blue">
            <div className="step-number">2</div>
            <div className="step-icon">📚</div>
            <h3>Get Materials</h3>
            <p>Receive curated videos, readings, and vocabulary each week.</p>
          </article>

          <article className="home-step step-green">
            <div className="step-number">3</div>
            <div className="step-icon">🎥</div>
            <h3>Attend Classes</h3>
            <p>Join free live sessions with teachers every week.</p>
          </article>

          <article className="home-step step-orange">
            <div className="step-number">4</div>
            <div className="step-icon">💬</div>
            <h3>Practice & Debate</h3>
            <p>Discuss topics with your group and sharpen your thinking.</p>
          </article>
        </div>
      </section>

      {/* Features - Duolingo Style Cards */}
      <section className="home-section home-features-section">
        <h2 className="home-section-title">Everything you need to grow</h2>

        <div className="home-features">
          <article className="home-feature-card feature-coral">
            <div className="feature-emoji">🎬</div>
            <h3>Weekly Live Sessions</h3>
            <p>Free lessons with teachers focused on the seasonal topic.</p>
            <span className="feature-tag">Free</span>
          </article>

          <article className="home-feature-card feature-mint">
            <div className="feature-emoji">📖</div>
            <h3>Curated Materials</h3>
            <p>Videos, readings, and vocabulary from professional mentors.</p>
            <span className="feature-tag">Quality</span>
          </article>

          <article className="home-feature-card feature-sky">
            <div className="feature-emoji">🌏</div>
            <h3>Global Community</h3>
            <p>Discuss and practice arguments with peers around the world.</p>
            <span className="feature-tag">Connect</span>
          </article>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="home-section home-cta-section">
        <div className="cta-card">
          <span className="cta-emoji">🚀</span>
          <h2>Ready to think in a new language?</h2>
          <p>Join thousands of learners debating their way to fluency.</p>
          <div className="cta-buttons">
            {isLoggedIn ? (
              <Link className="home-cta-primary" href="/account">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link className="home-cta-primary" href="/signin">
                  Join Free Today →
                </Link>
                <Link className="home-cta-ghost" href="/groups">
                  Browse Groups First
                </Link>
              </>
            )}
          </div>
          <p className="cta-note">✨ Free forever. No credit card required.</p>
        </div>
      </section>
    </>
  );
}
