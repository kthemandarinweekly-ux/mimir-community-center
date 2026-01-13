import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function MinimalNav() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <header className="minimal-nav">
      <Link className="minimal-brand" href="/">
        Open Debate
      </Link>
      <nav className="minimal-links">
        <Link href="/">Home</Link>
        <Link href="/groups">Groups</Link>
        <Link href="/calendar">Calendar</Link>
        {isLoggedIn ? (
          <Link href="/account" className="nav-account-link">
            My Account
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
