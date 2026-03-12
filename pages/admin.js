import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NavBar from "../components/NavBar";

export default function AdminPage() {
  const { data: session } = useSession();
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(session?.user?.email || "");
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "Class",
    start: "",
    end: "",
    description: "",
    location: "",
    link: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, membersRes, threadsRes, repliesRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/members"),
        fetch("/api/threads"),
        fetch("/api/replies"),
      ]);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData.threads || []);
      }
      if (repliesRes.ok) {
        const repliesData = await repliesRes.json();
        setReplies(repliesData.replies || []);
      }
    } catch (err) {
      setError("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!form.title || !form.start) {
      setError("Title and start date are required.");
      return;
    }
    setError("");
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError("Unable to create event.");
      return;
    }
    setForm({
      title: "",
      type: "Class",
      start: "",
      end: "",
      description: "",
      location: "",
      link: "",
    });
    loadData();
  };

  const handleUpdate = async (eventId) => {
    const draft = drafts[eventId] || {};
    const response = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      setError("Unable to update event.");
      return;
    }
    loadData();
  };

  const setDraftField = (eventId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [eventId]: {
        ...events.find((item) => item.id === eventId),
        ...prev[eventId],
        [field]: value,
      },
    }));
  };

  return (
    <>
      <Head>
        <title>Mimir Community Center | Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght;400;500;600;700;800&display=swap"
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
              <h2>Overview</h2>
              {loading ? <p className="label">Loading dashboard...</p> : null}
              <div className="stat-grid two">
                <div>
                  <p className="label">Members</p>
                  <p className="value">{members.length}</p>
                </div>
                <div>
                  <p className="label">Events</p>
                  <p className="value">{events.length}</p>
                </div>
                <div>
                  <p className="label">Topics</p>
                  <p className="value">{threads.length}</p>
                </div>
                <div>
                  <p className="label">Replies</p>
                  <p className="value">{replies.length}</p>
                </div>
              </div>
            </section>

            <section className="admin-card">
              <h2>Members</h2>
              {loading ? <p className="label">Loading members...</p> : null}
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Primary group</span>
                </div>
                {members.length === 0 ? (
                  <div className="admin-row">
                    <span>Set up Airtable Members table</span>
                    <span>members@example.com</span>
                    <span>Intermediate English</span>
                  </div>
                ) : (
                  members.map((user) => (
                    <div key={user.email} className="admin-row">
                      <span>{user.name}</span>
                      <span>{user.email}</span>
                      <span>{user.group}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="admin-card">
              <h2>Calendar events</h2>
              {error ? <p className="label">{error}</p> : null}
              <div className="admin-event editor">
                <div>
                  <h3>New event</h3>
                  <p className="label">Add a class, debate prep, or competition</p>
                </div>
                <div className="admin-form">
                  <input
                    type="text"
                    placeholder="Title"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                  />
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                  >
                    <option value="Class">Class</option>
                    <option value="Debate Prep">Debate Prep</option>
                    <option value="Competition">Competition</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={form.start}
                    onChange={(event) => setForm({ ...form, start: event.target.value })}
                  />
                  <input
                    type="datetime-local"
                    value={form.end}
                    onChange={(event) => setForm({ ...form, end: event.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                  />
                  <input
                    type="url"
                    placeholder="Event link (optional)"
                    value={form.link}
                    onChange={(event) => setForm({ ...form, link: event.target.value })}
                  />
                  <textarea
                    rows={3}
                    placeholder="Short description (optional)"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                  <button className="cta small" type="button" onClick={handleCreate}>
                    Publish event
                  </button>
                </div>
              </div>
              {events.map((event) => (
                <div key={event.id} className="admin-event">
                  <div>
                    <input
                      type="text"
                      defaultValue={event.title}
                      onChange={(evt) => setDraftField(event.id, "title", evt.target.value)}
                    />
                    <p className="label">Event title</p>
                  </div>
                  <div className="admin-form inline">
                    <select
                      defaultValue={event.type}
                      onChange={(evt) => setDraftField(event.id, "type", evt.target.value)}
                    >
                      <option value="Class">Class</option>
                      <option value="Debate Prep">Debate Prep</option>
                      <option value="Competition">Competition</option>
                    </select>
                    <input
                      type="datetime-local"
                      defaultValue={event.start ? event.start.slice(0, 16) : ""}
                      onChange={(evt) => setDraftField(event.id, "start", evt.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="Event link"
                      defaultValue={event.link}
                      onChange={(evt) => setDraftField(event.id, "link", evt.target.value)}
                    />
                  </div>
                  <button className="cta small" type="button" onClick={() => handleUpdate(event.id)}>
                    Save
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
