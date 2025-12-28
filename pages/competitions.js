import Head from "next/head";
import Link from "next/link";
import NavBar from "../components/NavBar";

export default function CompetitionsPage() {
  return (
    <>
      <Head>
        <title>Mimir Community Center | Competitions</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header">
        <NavBar />
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Seasonal debates</p>
            <h1>Compete with a global community</h1>
            <p className="lead">
              Every season features coached prep, qualifying rounds, and a live showcase.
              Apply solo or with a partner.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/signin">
                Apply for this season
              </Link>
              <Link className="cta ghost" href="/calendar">
                View timeline
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Season theme</span>
              <h3>Technology &amp; human connection</h3>
              <p>Debate how innovation reshapes empathy, community, and culture.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Applications close</p>
                <p className="value">May 14</p>
              </div>
              <div>
                <p className="label">Finals</p>
                <p className="value">June 28</p>
              </div>
              <Link className="cta small" href="/signin">
                Start application
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Competition format</p>
              <h2>How the season works</h2>
            </div>
            <p className="section-sub">
              Each round pairs you with a debate partner and includes guided feedback.
            </p>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step">01</span>
              <h3>Prep weeks</h3>
              <p>Topic packs, mentor sessions, and weekly speaking drills.</p>
            </div>
            <div className="flow-step">
              <span className="step">02</span>
              <h3>Qualifiers</h3>
              <p>Online rounds with peer and judge feedback.</p>
            </div>
            <div className="flow-step">
              <span className="step">03</span>
              <h3>Finals showcase</h3>
              <p>Top teams debate live with a global audience.</p>
            </div>
          </div>
        </section>

        <section className="section highlight">
          <div className="section-head">
            <div>
              <p className="eyebrow">Open rounds</p>
              <h2>Apply for your preferred round</h2>
            </div>
            <p className="section-sub">
              Choose the round that fits your availability. You can update it later.
            </p>
          </div>
          <div className="events-grid">
            <article className="event-card">
              <div>
                <p className="label">Round 1 · Online</p>
                <h3>International friendly match</h3>
                <p>Pair with a partner from another language track.</p>
              </div>
              <div className="card-actions">
                <Link className="cta small" href="/competitions/international-friendly-match">
                  View details
                </Link>
                <Link className="cta ghost small" href="/signin">
                  Apply
                </Link>
              </div>
            </article>
            <article className="event-card">
              <div>
                <p className="label">Round 2 · Regional</p>
                <h3>Regional language showcase</h3>
                <p>Compete within your cohort for mentoring credits.</p>
              </div>
              <div className="card-actions">
                <Link className="cta small" href="/competitions/regional-language-showcase">
                  View details
                </Link>
                <Link className="cta ghost small" href="/signin">
                  Apply
                </Link>
              </div>
            </article>
            <article className="event-card">
              <div>
                <p className="label">Finals · Live stream</p>
                <h3>Global debate summit</h3>
                <p>Top teams present to community and guest judges.</p>
              </div>
              <div className="card-actions">
                <Link className="cta small" href="/competitions/global-debate-summit">
                  View details
                </Link>
                <Link className="cta ghost small" href="/signin">
                  Apply
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="logo-name">Mimir</p>
          <p className="footer-note">Community for serious language momentum.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/groups">Groups</Link>
          <Link href="/calendar">Calendar</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
