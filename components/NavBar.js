import Link from "next/link";
import { useSession } from "next-auth/react";
import { useProfile } from "./useProfile";
import { useBadge } from "./useBadge";
import { useMemberships } from "./useMemberships";
import { useEffect, useState } from "react";

export default function NavBar({ action }) {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const { memberships } = useMemberships();
  const [userStats, setUserStats] = useState({ groupsJoined: 0, eventsSaved: 0 });

  // Fetch user stats for badge calculation
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchStats = async () => {
      try {
        // Get RSVPs count
        const rsvpRes = await fetch(`/api/rsvps?email=${encodeURIComponent(session.user.email)}`);
        const rsvpData = rsvpRes.ok ? await rsvpRes.json() : { rsvps: [] };

        setUserStats({
          groupsJoined: memberships.length,
          eventsSaved: rsvpData.rsvps?.length || 0,
          materialsSaved: 0,
          threadsStarted: 0,
          repliesMade: 0,
        });
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    };

    fetchStats();
  }, [session?.user?.email, memberships.length]);

  const badgeInfo = useBadge(userStats);
  const userLabel = session?.user?.name || session?.user?.email || "Account";
  const nickname = profile.nickname?.trim();
  const actionHref = action?.href || (session ? "/account" : "/signin");
  const actionLabel = action?.label || (session ? nickname || userLabel : "Sign in");
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
        <Link href="/competitions">Debate</Link>
        <Link href="/groups">Groups</Link>
        <Link href="/calendar">Calendar</Link>
        <Link href="/announcements">Announcements</Link>
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
      </div>
      <Link className={`${actionClass} nav-account`} href={actionHref}>
        {session && (
          <span
            className="nav-badge-icon"
            title={`${badgeInfo.badge.name} - Level ${badgeInfo.badge.level}`}
            style={{
              background: `linear-gradient(135deg, ${badgeInfo.badge.gradientStart} 0%, ${badgeInfo.badge.gradientEnd} 100%)`,
            }}
          >
            {badgeInfo.badge.emoji}
          </span>
        )}
        {actionLabel}
      </Link>
    </nav>
  );
}
