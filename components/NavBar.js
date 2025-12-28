import Link from "next/link";
import { useSession } from "next-auth/react";
import { useProfile } from "./useProfile";

export default function NavBar({ action }) {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const userLabel = session?.user?.name || session?.user?.email || "Account";
  const nickname = profile.nickname?.trim();
  const actionHref = action?.href || (session ? "/account" : "/signin");
  const actionLabel = action?.label || (session ? nickname || userLabel : "Sign in");
  const avatarSrc = profile.avatar
    ? `/avatars/${profile.avatar}.svg`
    : session?.user?.image || "/avatars/sunrise.svg";
  const actionClass = action?.className || "cta ghost";
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(session?.user?.email || "");

  return (
    <nav className="nav">
      <Link className="logo" href="/">
        <img className="logo-image" src="/logo.png" alt="Mimir penguin logo" />
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
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
      </div>
      <Link className={`${actionClass} nav-account`} href={actionHref}>
        {session ? <img className="nav-avatar" src={avatarSrc} alt="User avatar" /> : null}
        {actionLabel}
      </Link>
    </nav>
  );
}
