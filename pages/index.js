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
        <title>Open Debate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Hero Section - Full screen minimal */}
      <div className="debate-hero">
        <MinimalNav />

        <main className="debate-hero-content">
          <p className="debate-hero-eyebrow">For learners ready to go deeper</p>
          <h1 className="debate-title">Open Debate</h1>
          <p className="debate-tagline">Discuss real topics. Sharpen your thinking. Advance your fluency.</p>

          <div className="debate-hero-actions">
            {isLoggedIn ? (
              <Link className="debate-cta" href="/account">
                Go to My Dashboard
              </Link>
            ) : (
              <>
                <Link className="debate-cta" href="/signin">
                  Start Learning Free
                </Link>
                <Link className="debate-cta-secondary" href="/groups">
                  Explore Groups
                </Link>
              </>
            )}
          </div>
        </main>

        <div className="debate-scroll-hint">
          <span>Scroll to learn more</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 14l-5-5h10l-5 5z"/>
          </svg>
        </div>
      </div>

      {/* Season Topic Section */}
      <section className="debate-section debate-topic-section">
        <p className="debate-season-label">2023 Season 1</p>
        <h2 className="debate-topic">Should AI tools be used in schools?</h2>
        <p className="debate-topic-desc">
          One topic. Three languages. A global community debating together.
        </p>
        <div className="debate-languages">
          <span>Chinese</span>
          <span>Spanish</span>
          <span>English</span>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="debate-section debate-how-section">
        <p className="debate-section-label">How It Works</p>
        <h2 className="debate-section-heading">Your journey to fluency</h2>

        <div className="debate-steps">
          <article className="debate-step">
            <span className="debate-step-num">1</span>
            <h3>Join a Group</h3>
            <p>Pick your target language and level. Connect with learners worldwide who share your goals.</p>
          </article>

          <article className="debate-step">
            <span className="debate-step-num">2</span>
            <h3>Get Materials</h3>
            <p>Receive curated videos, readings, and vocabulary. Save what matters to your personal library.</p>
          </article>

          <article className="debate-step">
            <span className="debate-step-num">3</span>
            <h3>Attend Live Sessions</h3>
            <p>Join free weekly classes with teachers. Practice speaking in a supportive environment.</p>
          </article>

          <article className="debate-step">
            <span className="debate-step-num">4</span>
            <h3>Practice & Discuss</h3>
            <p>Meet with your group, share perspectives, and sharpen your arguments through real conversation.</p>
          </article>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="debate-section debate-offer-section">
        <h2 className="debate-section-title">Everything you need to grow</h2>

        <div className="debate-offers">
          <article className="debate-offer-card highlight">
            <div className="offer-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h3>Curated Materials</h3>
            <p>
              Videos, articles, and vocabulary lists carefully selected for each topic.
              Save your favorites and build your personal study library.
            </p>
          </article>

          <article className="debate-offer-card highlight">
            <div className="offer-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>Free Live Sessions</h3>
            <p>
              Weekly community classes with experienced teachers.
              Learn to structure arguments and express ideas clearly.
            </p>
          </article>

          <article className="debate-offer-card highlight">
            <div className="offer-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Practice Groups</h3>
            <p>
              Find partners who match your level. Discuss ideas, practice speaking,
              and grow together as a team.
            </p>
          </article>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="debate-section debate-cta-section">
        <h2>Ready to think in a new language?</h2>
        <p>Join thousands of learners debating their way to fluency.</p>
        <div className="debate-cta-row">
          {isLoggedIn ? (
            <Link className="debate-cta" href="/account">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link className="debate-cta" href="/signin">
                Join Free Today
              </Link>
              <Link className="debate-cta-ghost" href="/groups">
                Browse Groups First
              </Link>
            </>
          )}
        </div>
        <p className="debate-cta-note">Free community. No credit card required.</p>
      </section>
    </>
  );
}
