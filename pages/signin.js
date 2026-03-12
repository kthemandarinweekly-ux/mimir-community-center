import Head from "next/head";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MinimalNav from "../components/MinimalNav";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (router.query?.error) {
      setAuthError("Sign in failed. Please check your email and password.");
    }
  }, [router.query?.error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    const response = await signIn("credentials", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
      callbackUrl: "/account",
    });

    if (response?.error) {
      setAuthError("Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    await router.push("/account");
    setIsSubmitting(false);
  };

  return (
    <>
      <Head>
        <title>Sign In | Mimir Language Community</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="minimal-page">
        <MinimalNav />

        <main className="signin-container">
          <div className="signin-box">
            <div className="signin-header">
              <h1>Welcome back</h1>
              <p>Sign in to access your groups, saved materials, and upcoming events.</p>
            </div>

            <div className="signin-methods">
              <button
                className="signin-google"
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/account" })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="signin-divider">
                <span>or sign in with email</span>
              </div>

              <form className="signin-form" onSubmit={handleSubmit}>
                <label className="signin-field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="signin-field">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button className="signin-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
                {authError && <p className="label" style={{ color: "#c0392b", marginTop: "8px" }}>{authError}</p>}
              </form>
            </div>

            <p className="signin-footer">
              New here? Signing in creates your free account automatically.
            </p>
          </div>

          <div className="signin-benefits">
            <h2>Why join Mimir Language Community?</h2>
            <ul>
              <li>
                <strong>Save your progress</strong>
                <span>Track materials, groups, and upcoming events</span>
              </li>
              <li>
                <strong>Join live sessions</strong>
                <span>Get reminders for free weekly classes</span>
              </li>
              <li>
                <strong>Connect globally</strong>
                <span>Practice with learners from around the world</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
