import Head from "next/head";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import NavBar from "../components/NavBar";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const displayName = session?.user?.name || session?.user?.email || "Member";

  return (
    <>
      <Head>
        <title>Mimir Community Center | User Center</title>
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
        <section className="hero account-hero">
          <div className="hero-copy">
            <p className="eyebrow">User center</p>
            <h1>{displayName}</h1>
            <p className="lead">
              Manage your groups, track calendar reminders, and stay on top of the competitions
              you follow.
            </p>
            <div className="hero-actions">
              <Link className="cta" href="/groups">
                Browse groups
              </Link>
              <button className="cta ghost" type="button" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span className="pill">Membership status</span>
              <h3>Active member</h3>
              <p>Keep your profile updated to get matched with debate partners.</p>
            </div>
            <div className="hero-card-bottom">
              <div>
                <p className="label">Groups joined</p>
                <p className="value">3</p>
              </div>
              <div>
                <p className="label">Competitions</p>
                <p className="value">2</p>
              </div>
              <Link className="cta small" href="/competitions">
                Manage entries
              </Link>
            </div>
          </div>
        </section>
      </header>

      <main>
        {status === "unauthenticated" ? (
          <section className="section">
            <div className="notice">
              <div>
                <h4>You&apos;re not signed in</h4>
                <p>Sign in to personalize your dashboard.</p>
              </div>
              <Link className="cta small" href="/signin">
                Sign in
              </Link>
            </div>
          </section>
        ) : (
          <section className="section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Your activity</p>
                <h2>Your community dashboard</h2>
              </div>
              <p className="section-sub">
                Everything you follow lives here. Update preferences any time.
              </p>
            </div>
            <div className="account-grid">
              <article className="account-card">
                <h3>Groups you joined</h3>
                <ul className="list">
                  <li className="list-item">Advanced English · Speaking pod A</li>
                  <li className="list-item">Intermediate Chinese · Tuesday room</li>
                  <li className="list-item">Advanced Spanish · Mentor circle</li>
                </ul>
                <Link className="cta small" href="/groups">
                  Manage groups
                </Link>
              </article>
              <article className="account-card">
                <h3>Your calendar</h3>
                <ul className="list">
                  <li className="list-item">May 12 · Rebuttal toolkit workshop</li>
                  <li className="list-item">May 18 · Season kickoff live</li>
                  <li className="list-item">May 22 · Peer debate practice</li>
                </ul>
                <Link className="cta small" href="/calendar">
                  View calendar
                </Link>
              </article>
              <article className="account-card">
                <h3>Announcements for you</h3>
                <ul className="list">
                  <li className="list-item">New topic pack: Climate migration</li>
                  <li className="list-item">Mentor office hours reminder</li>
                  <li className="list-item">Round 1 pairing opens today</li>
                </ul>
                <Link className="cta small" href="/announcements">
                  See all
                </Link>
              </article>
              <article className="account-card">
                <h3>Competitions you follow</h3>
                <ul className="list">
                  <li className="list-item">International friendly match</li>
                  <li className="list-item">Regional language showcase</li>
                </ul>
                <Link className="cta small" href="/competitions">
                  Manage competitions
                </Link>
              </article>
            </div>
          </section>
        )}
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
