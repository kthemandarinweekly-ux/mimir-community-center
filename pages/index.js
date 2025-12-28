import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

function ToggleRow({ label, defaultOn }) {
  const [isOn, setIsOn] = useState(defaultOn);

  return (
    <div className="toggle">
      <span>{label}</span>
      <button
        className="toggle-btn"
        type="button"
        aria-pressed={isOn}
        onClick={() => setIsOn((value) => !value)}
      >
        {isOn ? "On" : "Off"}
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Mimir Community Center</title>
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
            <a href="#groups">Groups</a>
            <a href="#calendar">Calendar</a>
            <a href="#announcements">Announcements</a>
            <a href="#events">Competitions</a>
          </div>
          <Link className="cta ghost" href="/signin">
            Sign in
          </Link>
        </nav>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">For fluent-at-basics language learners</p>
            <h1>Open Debate</h1>
            <p className="lead">
              A free international community for intermediate and advanced learners of Chinese,
              Spanish, and English. Join cohort-based groups, practice with peers, and prepare
              for seasonal debate competitions.
            </p>
            <div className="hero-actions">
              <button className="cta" type="button">
                Join the community
              </button>
              <button className="cta ghost" type="button">
                Explore the calendar
              </button>
            </div>
            <div className="hero-meta">
              <div>
                <h4>6 learning tracks</h4>
                <p>Intermediate + advanced for each language</p>
              </div>
              <div>
                <h4>Weekly rhythms</h4>
                <p>Live classes, discussion prompts, and share-outs</p>
              </div>
              <div>
                <h4>Seasonal debates</h4>
                <p>Coached prep and global community rounds</p>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Next season theme</span>
              <h3>Technology &amp; human connection</h3>
              <p>Topic decks, reading lists, and speaking drills drop weekly.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Applications close</p>
                <p className="value">May 14</p>
              </div>
              <div>
                <p className="label">Live kickoff</p>
                <p className="value">May 18 · Online</p>
              </div>
              <button className="cta small" type="button">
                Apply for the season
              </button>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section id="groups" className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Join your track</p>
              <h2>Language groups built for momentum</h2>
            </div>
            <p className="section-sub">
              Each group has weekly discussion prompts, material sharing, and practice
              spaces for watch → read → speak progression.
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
              <button className="cta small" type="button">
                Join group
              </button>
            </article>
            <article className="group-card">
              <h3>Advanced Chinese</h3>
              <p>Sharpen nuance, rhetorical structure, and high-level vocabulary.</p>
              <div className="tag-row">
                <span>Advanced discourse</span>
                <span>Judge feedback</span>
              </div>
              <button className="cta small" type="button">
                Join group
              </button>
            </article>
            <article className="group-card">
              <h3>Intermediate Spanish</h3>
              <p>Practice arguments that combine cultural context and real-world themes.</p>
              <div className="tag-row">
                <span>Conversation ladders</span>
                <span>Media watchlists</span>
              </div>
              <button className="cta small" type="button">
                Join group
              </button>
            </article>
            <article className="group-card">
              <h3>Advanced Spanish</h3>
              <p>Refine persuasive speaking with high-impact, rapid rebuttal drills.</p>
              <div className="tag-row">
                <span>Expert mentor hours</span>
                <span>Style workshops</span>
              </div>
              <button className="cta small" type="button">
                Join group
              </button>
            </article>
            <article className="group-card">
              <h3>Intermediate English</h3>
              <p>Go beyond basics with guided speaking prompts and debate structures.</p>
              <div className="tag-row">
                <span>Discussion circles</span>
                <span>Vocabulary labs</span>
              </div>
              <button className="cta small" type="button">
                Join group
              </button>
            </article>
            <article className="group-card">
              <h3>Advanced English</h3>
              <p>Elevate tone, precision, and confidence for international rounds.</p>
              <div className="tag-row">
                <span>Live critiques</span>
                <span>Argument polish</span>
              </div>
              <button className="cta small" type="button">
                Join group
              </button>
            </article>
          </div>
        </section>

        <section className="section highlight">
          <div className="section-head">
            <div>
              <p className="eyebrow">Community flow</p>
              <h2>A guided path to fluency</h2>
            </div>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step">01</span>
              <h3>Watch</h3>
              <p>Curated videos, debate rounds, and cultural clips to listen actively.</p>
            </div>
            <div className="flow-step">
              <span className="step">02</span>
              <h3>Read</h3>
              <p>Weekly packs with articles, transcripts, and topical vocabulary.</p>
            </div>
            <div className="flow-step">
              <span className="step">03</span>
              <h3>Speak</h3>
              <p>Group discussions, mentor sessions, and competition rehearsals.</p>
            </div>
          </div>
        </section>

        <section id="calendar" className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Community calendar</p>
              <h2>Classes, live rooms, and open practice</h2>
            </div>
            <p className="section-sub">
              Admins can publish free events and details; members can RSVP and sync
              reminders.
            </p>
          </div>
          <div className="calendar">
            <div className="calendar-header">
              <h3>May 2025</h3>
              <button className="cta ghost small" type="button">
                View full calendar
              </button>
            </div>
            <div className="calendar-grid">
              <div className="calendar-item">
                <p className="label">May 02 · Live class</p>
                <h4>Debate structure essentials</h4>
                <p>All levels · 60 mins</p>
              </div>
              <div className="calendar-item">
                <p className="label">May 08 · Discussion</p>
                <h4>Ethics of AI in education</h4>
                <p>Intermediate cohorts</p>
              </div>
              <div className="calendar-item">
                <p className="label">May 12 · Workshop</p>
                <h4>Rebuttal toolkit</h4>
                <p>Advanced cohorts</p>
              </div>
              <div className="calendar-item">
                <p className="label">May 18 · Kickoff</p>
                <h4>Seasonal debate launch</h4>
                <p>All members · 90 mins</p>
              </div>
            </div>
          </div>
        </section>

        <section id="announcements" className="section split">
          <div className="announcement-panel">
            <p className="eyebrow">Announcements</p>
            <h2>Stay in the loop</h2>
            <p>
              Get notified when new materials drop, when registrations open, or when
              your group schedules a live room.
            </p>
            <div className="notice">
              <div>
                <h4>New topic pack: Climate migration</h4>
                <p>Chinese + English tracks · vocabulary &amp; readings available.</p>
              </div>
              <button className="cta small" type="button">
                View pack
              </button>
            </div>
            <div className="notice">
              <div>
                <h4>Mentor office hours</h4>
                <p>Spanish advanced · Fridays at 18:00 CET.</p>
              </div>
              <button className="cta small" type="button">
                Book a slot
              </button>
            </div>
          </div>
          <div className="notification-panel">
            <h3>Notification settings</h3>
            <p>Choose how you want to hear from us.</p>
            <ToggleRow label="Email digests" defaultOn />
            <ToggleRow label="Mobile alerts" defaultOn={false} />
            <ToggleRow label="Competition reminders" defaultOn />
            <button className="cta" type="button">
              Update preferences
            </button>
          </div>
        </section>

        <section id="events" className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Debate competitions</p>
              <h2>Apply to compete this season</h2>
            </div>
            <p className="section-sub">
              Competitions are open to all members. Each season includes prep rooms,
              live coaching, and a final showcase.
            </p>
          </div>
          <div className="events-grid">
            <article className="event-card">
              <div>
                <p className="label">Round 1 · Online</p>
                <h3>International friendly match</h3>
                <p>Pair with a partner from another language track.</p>
              </div>
              <button className="cta small" type="button">
                Apply
              </button>
            </article>
            <article className="event-card">
              <div>
                <p className="label">Round 2 · Regional</p>
                <h3>Regional language showcase</h3>
                <p>Compete within your cohort for mentoring credits.</p>
              </div>
              <button className="cta small" type="button">
                Apply
              </button>
            </article>
            <article className="event-card">
              <div>
                <p className="label">Finals · Live stream</p>
                <h3>Global debate summit</h3>
                <p>Top teams present to community and guest judges.</p>
              </div>
              <button className="cta small" type="button">
                Apply
              </button>
            </article>
          </div>
        </section>

        <section className="cta-section">
          <div>
            <h2>Ready to find your people?</h2>
            <p>
              Join the Mimir Community Center and meet learners who want to
              practice, debate, and grow beyond the basics.
            </p>
          </div>
          <div className="cta-actions">
            <button className="cta" type="button">
              Join for free
            </button>
            <button className="cta ghost" type="button">
              Schedule a tour
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="logo-name">Mimir</p>
          <p className="footer-note">Community for serious language momentum.</p>
        </div>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Guidelines</a>
          <a href="#">Support</a>
        </div>
        <p className="footer-note">© 2025 Mimir. All rights reserved.</p>
      </footer>
    </>
  );
}
