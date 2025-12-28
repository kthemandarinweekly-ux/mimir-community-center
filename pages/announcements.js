import Head from "next/head";
import Link from "next/link";
import NavBar from "../components/NavBar";

export default function AnnouncementsPage() {
  return (
    <>
      <Head>
        <title>Mimir Community Center | Announcements</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header">
        <NavBar />
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Community updates</p>
            <h1>Announcements &amp; notifications</h1>
            <p className="lead">
              Stay synced on topic packs, group updates, and competition reminders.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/signin">
                Turn on notifications
              </Link>
              <Link className="cta ghost" href="/calendar">
                View calendar
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Latest drop</span>
              <h3>Climate migration pack</h3>
              <p>Key readings, debate frames, and discussion prompts.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Language</p>
                <p className="value">CN · EN · ES</p>
              </div>
              <div>
                <p className="label">Updated</p>
                <p className="value">Today</p>
              </div>
              <Link className="cta small" href="/signin">
                Get the pack
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section split">
          <div className="announcement-panel">
            <p className="eyebrow">What&apos;s new</p>
            <h2>Latest announcements</h2>
            <p>
              Admins post weekly updates, mentor availability, and competition prep notes.
            </p>
            <div className="notice">
              <div>
                <h4>New topic pack: Climate migration</h4>
                <p>Chinese + English tracks · vocabulary &amp; readings available.</p>
              </div>
              <Link className="cta small" href="/signin">
                View pack
              </Link>
            </div>
            <div className="notice">
              <div>
                <h4>Mentor office hours</h4>
                <p>Spanish advanced · Fridays at 18:00 CET.</p>
              </div>
              <Link className="cta small" href="/signin">
                Book a slot
              </Link>
            </div>
            <div className="notice">
              <div>
                <h4>Round 1 pairing open</h4>
                <p>Find a partner from another language group.</p>
              </div>
              <Link className="cta small" href="/competitions">
                Apply
              </Link>
            </div>
          </div>
          <div className="notification-panel">
            <h3>Notification settings</h3>
            <p>Choose how you want to hear from us.</p>
            <div className="toggle">
              <span>Email digests</span>
              <button className="toggle-btn" type="button" aria-pressed="true">
                On
              </button>
            </div>
            <div className="toggle">
              <span>Mobile alerts</span>
              <button className="toggle-btn" type="button" aria-pressed="false">
                Off
              </button>
            </div>
            <div className="toggle">
              <span>Competition reminders</span>
              <button className="toggle-btn" type="button" aria-pressed="true">
                On
              </button>
            </div>
            <Link className="cta" href="/signin">
              Update preferences
            </Link>
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
