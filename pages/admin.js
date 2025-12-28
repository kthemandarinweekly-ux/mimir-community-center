import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import NavBar from "../components/NavBar";

const users = [
  { name: "Ariana Chen", email: "ariana@example.com", group: "Adv English" },
  { name: "Luis Ortega", email: "luis@example.com", group: "Int Spanish" },
  { name: "Mei Tan", email: "mei@example.com", group: "Adv Chinese" },
];

const events = [
  {
    title: "Debate structure essentials",
    date: "May 02",
    link: "https://zoom.us/class-101",
  },
  { title: "Rebuttal toolkit", date: "May 12", link: "https://zoom.us/class-202" },
];

const competitions = [
  { title: "International friendly match", link: "https://forms.gle/apply1" },
  { title: "Regional language showcase", link: "https://forms.gle/apply2" },
];

export default function AdminPage() {
  const { data: session } = useSession();
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(session?.user?.email || "");

  return (
    <>
      <Head>
        <title>Mimir Community Center | Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header compact">
        <NavBar action={{ label: "User center", href: "/account" }} />
        <section className="detail-hero">
          <div>
            <p className="eyebrow">Admin center</p>
            <h1>Manage community operations</h1>
            <p className="lead">
              Edit events, update calendar links, and keep track of member growth.
            </p>
          </div>
        </section>
      </header>

      <main className="section admin-layout">
        {!isAdmin ? (
          <div className="notice">
            <div>
              <h4>Admin access only</h4>
              <p>Add your email to NEXT_PUBLIC_ADMIN_EMAILS to unlock this view.</p>
            </div>
            <Link className="cta small" href="/signin">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <section className="admin-card">
              <h2>Members</h2>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Primary group</span>
                </div>
                {users.map((user) => (
                  <div key={user.email} className="admin-row">
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                    <span>{user.group}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h2>Upcoming events</h2>
              {events.map((event) => (
                <div key={event.title} className="admin-event">
                  <div>
                    <h3>{event.title}</h3>
                    <p className="label">{event.date}</p>
                  </div>
                  <input type="url" defaultValue={event.link} />
                  <button className="cta small" type="button">
                    Save
                  </button>
                </div>
              ))}
              <button className="cta ghost small" type="button">
                Add new event
              </button>
            </section>

            <section className="admin-card">
              <h2>Competition links</h2>
              {competitions.map((comp) => (
                <div key={comp.title} className="admin-event">
                  <div>
                    <h3>{comp.title}</h3>
                    <p className="label">Application link</p>
                  </div>
                  <input type="url" defaultValue={comp.link} />
                  <button className="cta small" type="button">
                    Save
                  </button>
                </div>
              ))}
              <button className="cta ghost small" type="button">
                Add competition
              </button>
            </section>
          </>
        )}
      </main>
    </>
  );
}
