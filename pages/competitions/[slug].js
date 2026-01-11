import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";

const competitions = {
  "international-friendly-match": {
    name: "International friendly match",
    round: "Season spotlight",
    description:
      "Pair with a partner from another language track and explore a shared motion.",
    date: "May 22",
    duration: "75 mins",
    spots: "64 teams",
    focus: ["Partner matching", "Coach feedback", "Global audience"],
  },
  "regional-language-showcase": {
    name: "Regional language showcase",
    round: "Season spotlight",
    description:
      "Practice within your cohort and share your perspective with the community.",
    date: "June 08",
    duration: "90 mins",
    spots: "48 teams",
    focus: ["Regional panels", "Debate reviews", "Language awards"],
  },
  "global-debate-summit": {
    name: "Global debate summit",
    round: "Season spotlight",
    description:
      "Join the full community for a global discussion showcase.",
    date: "June 28",
    duration: "120 mins",
    spots: "12 teams",
    focus: ["Live audience", "Guest judges", "Awards"],
  },
};

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const event = competitions[slug] || {
    name: "Community event",
    round: "Season event",
    description: "A guided community event for debate practice.",
    date: "TBD",
    duration: "60 mins",
    spots: "--",
    focus: ["Preparation", "Live debate", "Feedback"],
  };

  return (
    <>
      <Head>
        <title>Mimir Community Center | {event.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact">
        <NavBar />
        <section className="detail-hero">
          <div>
            <p className="eyebrow">{event.round}</p>
            <h1>{event.name}</h1>
            <p className="lead">{event.description}</p>
            <div className="detail-actions">
              <Link className="cta" href="/competitions">
                View season topic
              </Link>
              <Link className="cta ghost" href="/calendar">
                Add to calendar
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main className="section detail-layout">
        <div className="detail-main">
          <div className="detail-media">
            <div className="media-placeholder">
              <span>Event highlight reel</span>
            </div>
            <div className="media-thumbs">
              <div className="thumb">Topic framing</div>
              <div className="thumb">Judge rubric</div>
              <div className="thumb">Prep checklist</div>
              <div className="thumb">Sample debates</div>
            </div>
          </div>

          <section className="detail-section">
            <h2>What to expect</h2>
            <ul className="detail-list">
              <li>Receive the motion and prep kit 7 days in advance.</li>
              <li>Join a short warm-up with your partner and coach.</li>
              <li>Share perspectives and get feedback after the session.</li>
            </ul>
          </section>

          <section className="detail-section">
            <h2>Session flow</h2>
            <div className="detail-cards">
              <article className="detail-card">
                <p className="label">Prep window</p>
                <h3>7-day preparation</h3>
                <p>Guided prompts + optional mentor sessions.</p>
              </article>
              <article className="detail-card">
                <p className="label">Live session</p>
                <h3>Community discussion</h3>
                <p>Opening statements, discussion, and feedback.</p>
              </article>
            </div>
          </section>
        </div>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Event details</h3>
            <div className="stat-grid">
              <div>
                <p className="label">Date</p>
                <p className="value">{event.date}</p>
              </div>
              <div>
                <p className="label">Duration</p>
                <p className="value">{event.duration}</p>
              </div>
              <div>
                <p className="label">Spots</p>
                <p className="value">{event.spots}</p>
              </div>
            </div>
            <div className="tag-stack">
              {event.focus.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <Link className="cta" href="/competitions">
              View materials
            </Link>
          </div>

          <div className="side-card">
            <h3>Related announcements</h3>
            <ul className="detail-list">
              <li>Motion briefing release date</li>
              <li>Partner matching opens</li>
              <li>Coach office hours</li>
            </ul>
            <Link className="cta ghost" href="/announcements">
              See updates
            </Link>
          </div>
        </aside>
      </main>
    </>
  );
}
