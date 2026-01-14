import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useBadge } from "./useBadge";
import { useMemberships } from "./useMemberships";
import { useProfile } from "./useProfile";

export default function MinimalNav() {
  const { data: session, status } = useSession();
  const { profile } = useProfile();
  const { memberships } = useMemberships();
  const [userStats, setUserStats] = useState({ groupsJoined: 0 });
  const isLoggedIn = status === "authenticated";

  // Fetch user stats for badge
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchStats = async () => {
      try {
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
  const displayName = profile.nickname || session?.user?.name || "My Account";

  return (
    <header className="minimal-nav">
      <Link className="minimal-brand" href="/">
        Mimir Language Community
      </Link>
      <nav className="minimal-links">
        <Link href="/debate">Debate</Link>
        <Link href="/groups">Groups</Link>
        <Link href="/calendar">Calendar</Link>
        {isLoggedIn ? (
          <Link href="/account" className="nav-account-link">
            <span
              className="nav-badge-icon"
              title={`${badgeInfo.badge.name} - Level ${badgeInfo.badge.level}`}
              style={{
                background: `linear-gradient(135deg, ${badgeInfo.badge.gradientStart} 0%, ${badgeInfo.badge.gradientEnd} 100%)`,
              }}
            >
              {badgeInfo.badge.emoji}
            </span>
            {displayName}
          </Link>
        ) : (
          <Link href="/signin" className="nav-signin-link">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
