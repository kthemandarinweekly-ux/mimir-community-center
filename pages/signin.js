import Head from "next/head";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: "/",
    });
    setIsSubmitting(false);
  };

  return (
    <>
      <Head>
        <title>Mimir Community Center | Sign In</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="grain"></div>
      <header className="site-header">
        <nav className="nav">
          <div className="logo">
            <span className="logo-mark">M</span>
            <div>
              <p className="logo-name">Mimir</p>
              <p className="logo-tag">Community Center</p>
            </div>
          </div>
          <div className="nav-links">
            <Link href="/#groups">Groups</Link>
            <Link href="/#calendar">Calendar</Link>
            <Link href="/#announcements">Announcements</Link>
            <Link href="/#events">Competitions</Link>
          </div>
          <Link className="cta ghost" href="/">
            Back home
          </Link>
        </nav>
      </header>

      <main>
        <section className="section signin-section">
          <div className="signin-card">
            <div className="signin-copy">
              <p className="eyebrow">Welcome back</p>
              <h1>Sign in to Open Debate</h1>
              <p className="lead">
                Connect with your cohorts, RSVP to events, and get notified on new
                topic packs.
              </p>
            </div>
            <div className="signin-actions">
              <button
                className="cta google"
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <span className="dot"></span>
                Continue with Google
              </button>
              <div className="divider">
                <span>or</span>
              </div>
              <form className="signin-form" onSubmit={handleSubmit}>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <button className="cta" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
              <p className="signin-footer">
                New here? <a href="#">Join for free</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
