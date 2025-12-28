import Head from "next/head";
import Link from "next/link";
import NavBar from "../components/NavBar";

export default function CalendarPage() {
  return (
    <>
      <Head>
        <title>Mimir Community Center | Calendar</title>
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
            <p className="eyebrow">Community schedule</p>
            <h1>Calendar of classes &amp; debate prep</h1>
            <p className="lead">
              Stay ahead with a clear weekly rhythm. Admins post free sessions, topical
              discussions, and competition milestones.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/signin">
                RSVP to sessions
              </Link>
              <Link className="cta ghost" href="/competitions">
                View competition timeline
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">This month</span>
              <h3>May cohort rhythm</h3>
              <p>Live classes on Tuesdays, community debates on Saturdays.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Live sessions</p>
                <p className="value">8 events</p>
              </div>
              <div>
                <p className="label">Discussion rooms</p>
                <p className="value">12 rooms</p>
              </div>
              <Link className="cta small" href="/announcements">
                See reminders
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">May 2025</p>
              <h2>Featured classes</h2>
            </div>
            <p className="section-sub">
              All events are free. RSVP to get reminders and prep materials delivered.
            </p>
          </div>
          <div className="calendar">
            <div className="calendar-header">
              <h3>Week 1</h3>
              <Link className="cta ghost small" href="/signin">
                RSVP for week
              </Link>
            </div>
            <div className="calendar-grid">
              <Link className="calendar-item" href="/calendar/debate-structure-essentials">
                <p className="label">May 02 · Live class</p>
                <h4>Debate structure essentials</h4>
                <p>All levels · 60 mins</p>
              </Link>
              <Link className="calendar-item" href="/calendar/opening-statements-clinic">
                <p className="label">May 03 · Speaking lab</p>
                <h4>Opening statements clinic</h4>
                <p>Intermediate cohorts</p>
              </Link>
              <Link className="calendar-item" href="/calendar/mentor-office-hours">
                <p className="label">May 04 · Office hours</p>
                <h4>Mentor Q&amp;A</h4>
                <p>Advanced cohorts</p>
              </Link>
              <Link className="calendar-item" href="/calendar/global-perspective-circle">
                <p className="label">May 05 · Community circle</p>
                <h4>Global perspective exchange</h4>
                <p>All members · 45 mins</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="section highlight">
          <div className="section-head">
            <div>
              <p className="eyebrow">Upcoming</p>
              <h2>Competition milestones</h2>
            </div>
            <p className="section-sub">
              The seasonal debate builds each week. Track key dates and prep deadlines.
            </p>
          </div>
          <div className="events-grid">
            <article className="event-card">
              <div>
                <p className="label">May 12</p>
                <h3>Motion briefing released</h3>
                <p>Topic packets + glossary shared in all groups.</p>
              </div>
              <Link className="cta small" href="/announcements">
                View briefing
              </Link>
            </article>
            <article className="event-card">
              <div>
                <p className="label">May 18</p>
                <h3>Season kickoff</h3>
                <p>Live session with judges and coaching partners.</p>
              </div>
              <Link className="cta small" href="/competitions">
                Join kickoff
              </Link>
            </article>
            <article className="event-card">
              <div>
                <p className="label">June 02</p>
                <h3>Round submissions due</h3>
                <p>Submit your team lineup and preferred time zone.</p>
              </div>
              <Link className="cta small" href="/competitions">
                Apply now
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
          <Link href="/groups">Groups</Link>
          <Link href="/competitions">Competitions</Link>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
