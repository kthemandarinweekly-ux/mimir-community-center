import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavBar({ action }) {
  const { data: session } = useSession();
  const userLabel = session?.user?.name || session?.user?.email || "Account";
  const actionHref = action?.href || (session ? "/account" : "/signin");
  const actionLabel = action?.label || (session ? userLabel : "Sign in");
  const actionClass = action?.className || "cta ghost";

  return (
    <nav className="nav">
      <Link className="logo" href="/">
        <span className="logo-mark">M</span>
        <div>
          <p className="logo-name">Mimir</p>
          <p className="logo-tag">Community Center</p>
        </div>
      </Link>
      <div className="nav-links">
        <Link href="/groups">Groups</Link>
        <Link href="/calendar">Calendar</Link>
        <Link href="/announcements">Announcements</Link>
        <Link href="/competitions">Competitions</Link>
      </div>
      <Link className={actionClass} href={actionHref}>
        {actionLabel}
      </Link>
    </nav>
  );
}
