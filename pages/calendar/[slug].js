import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";

const classes = {
  "debate-structure-essentials": {
    name: "Debate structure essentials",
    type: "Live class",
    description: "Learn the core structure for persuasive arguments in three steps.",
    date: "May 02",
    time: "19:00 GMT",
    duration: "60 mins",
  },
  "opening-statements-clinic": {
    name: "Opening statements clinic",
    type: "Speaking lab",
    description: "Practice strong openings and receive feedback from peers.",
    date: "May 03",
    time: "18:00 GMT",
    duration: "45 mins",
  },
  "mentor-office-hours": {
    name: "Mentor Q&A",
    type: "Office hours",
    description: "Bring your current debate outline and get live coaching.",
    date: "May 04",
    time: "17:00 GMT",
    duration: "45 mins",
  },
  "global-perspective-circle": {
    name: "Global perspective exchange",
    type: "Community circle",
    description: "Share perspectives across language tracks and build empathy.",
    date: "May 05",
    time: "16:00 GMT",
    duration: "45 mins",
  },
};

export default function ClassDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const session = classes[slug] || {
    name: "Community session",
    type: "Live class",
    description: "Join a live session with the community.",
    date: "TBD",
    time: "TBD",
    duration: "60 mins",
  };

  return (
    <>
      <Head>
        <title>Mimir Community Center | {session.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact">
        <NavBar />
        <section className="detail-hero">
          <div>
            <p className="eyebrow">{session.type}</p>
            <h1>{session.name}</h1>
            <p className="lead">{session.description}</p>
            <div className="detail-actions">
              <Link className="cta" href="/signin">
                RSVP for class
              </Link>
              <Link className="cta ghost" href="/calendar">
                Back to calendar
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main className="section detail-layout">
        <div className="detail-main">
          <div className="detail-media">
            <div className="media-placeholder">
              <span>Class preview</span>
            </div>
            <div className="media-thumbs">
              <div className="thumb">Slides</div>
              <div className="thumb">Reading list</div>
              <div className="thumb">Warm-up drill</div>
              <div className="thumb">Discussion prompts</div>
            </div>
          </div>

          <section className="detail-section">
            <h2>Class format</h2>
            <ul className="detail-list">
              <li>Quick warm-up and vocabulary check-in.</li>
              <li>Guided lesson with live examples.</li>
              <li>Small-group practice with feedback.</li>
            </ul>
          </section>
        </div>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Session details</h3>
            <div className="stat-grid">
              <div>
                <p className="label">Date</p>
                <p className="value">{session.date}</p>
              </div>
              <div>
                <p className="label">Time</p>
                <p className="value">{session.time}</p>
              </div>
              <div>
                <p className="label">Duration</p>
                <p className="value">{session.duration}</p>
              </div>
            </div>
            <Link className="cta" href="/signin">
              RSVP now
            </Link>
          </div>

          <div className="side-card">
            <h3>Related events</h3>
            <ul className="detail-list">
              <li>Community speaking pods</li>
              <li>Mentor office hours</li>
              <li>Season kickoff</li>
            </ul>
            <Link className="cta ghost" href="/competitions">
              See competitions
            </Link>
          </div>
        </aside>
      </main>
    </>
  );
}
