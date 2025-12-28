import Head from "next/head";
import Link from "next/link";

export default function GroupsPage() {
  return (
    <>
      <Head>
        <title>Mimir Community Center | Groups</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header">
        <nav className="nav">
          <div className="logo">
            <span className="logo-mark">M</span>
            <div>
              <p className="logo-name">Mimir</p>
              <p className="logo-tag">Community Center</p>
            </div>
          </div>
          <div className="nav-links">
            <Link href="/groups">Groups</Link>
            <Link href="/calendar">Calendar</Link>
            <Link href="/announcements">Announcements</Link>
            <Link href="/competitions">Competitions</Link>
          </div>
          <Link className="cta ghost" href="/signin">
            Sign in
          </Link>
        </nav>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Choose your track</p>
            <h1>Find the group that matches your fluency</h1>
            <p className="lead">
              Every track is cohort-based. You will get weekly prompts, speaking pods, and
              materials focused on debate-ready language.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/signin">
                Join now
              </Link>
              <Link className="cta ghost" href="/calendar">
                See upcoming classes
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">How it works</span>
              <h3>Intermediate or advanced</h3>
              <p>Pick your level, then join weekly discussions and seasonal debates.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Weekly time</p>
                <p className="value">90 mins</p>
              </div>
              <div>
                <p className="label">Practice mode</p>
                <p className="value">Peer + mentor</p>
              </div>
              <Link className="cta small" href="/competitions">
                See competitions
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Chinese tracks</p>
              <h2>Chinese language groups</h2>
            </div>
            <p className="section-sub">
              From intermediate clarity to advanced nuance, practice persuasive speaking with
              weekly debate prompts and shared reading lists.
            </p>
          </div>
          <div className="group-grid">
            <article className="group-card">
              <h3>Intermediate Chinese</h3>
              <p>Build fluency by turning news clips and essays into live debates.</p>
              <div className="tag-row">
                <span>Weekly clinics</span>
                <span>Peer speaking pods</span>
              </div>
              <Link className="cta small" href="/signin">
                Join group
              </Link>
            </article>
            <article className="group-card">
              <h3>Advanced Chinese</h3>
              <p>Sharpen nuance, rhetorical structure, and high-level vocabulary.</p>
              <div className="tag-row">
                <span>Advanced discourse</span>
                <span>Judge feedback</span>
              </div>
              <Link className="cta small" href="/signin">
                Join group
              </Link>
            </article>
          </div>
        </section>

        <section className="section highlight">
          <div className="section-head">
            <div>
              <p className="eyebrow">Spanish tracks</p>
              <h2>Spanish language groups</h2>
            </div>
            <p className="section-sub">
              Apply debate structures to global topics and cultural context with
              coached speaking labs.
            </p>
          </div>
          <div className="group-grid">
            <article className="group-card">
              <h3>Intermediate Spanish</h3>
              <p>Practice arguments that combine cultural context and real-world themes.</p>
              <div className="tag-row">
                <span>Conversation ladders</span>
                <span>Media watchlists</span>
              </div>
              <Link className="cta small" href="/signin">
                Join group
              </Link>
            </article>
            <article className="group-card">
              <h3>Advanced Spanish</h3>
              <p>Refine persuasive speaking with high-impact, rapid rebuttal drills.</p>
              <div className="tag-row">
                <span>Expert mentor hours</span>
                <span>Style workshops</span>
              </div>
              <Link className="cta small" href="/signin">
                Join group
              </Link>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">English tracks</p>
              <h2>English language groups</h2>
            </div>
            <p className="section-sub">
              Build confidence with structured debate prompts, vocabulary labs, and
              fast rebuttal practice.
            </p>
          </div>
          <div className="group-grid">
            <article className="group-card">
              <h3>Intermediate English</h3>
              <p>Go beyond basics with guided speaking prompts and debate structures.</p>
              <div className="tag-row">
                <span>Discussion circles</span>
                <span>Vocabulary labs</span>
              </div>
              <Link className="cta small" href="/signin">
                Join group
              </Link>
            </article>
            <article className="group-card">
              <h3>Advanced English</h3>
              <p>Elevate tone, precision, and confidence for international rounds.</p>
              <div className="tag-row">
                <span>Live critiques</span>
                <span>Argument polish</span>
              </div>
              <Link className="cta small" href="/signin">
                Join group
              </Link>
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
          <Link href="/calendar">Calendar</Link>
          <Link href="/competitions">Competitions</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
