"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MailIcon } from "./Icons";

// Google sign-in is hidden until the Google provider is set up in Supabase.
const GOOGLE_SIGNIN_ENABLED = false;

// Turn a Supabase error into plain words.
function friendlyError(error: { message: string; status?: number; code?: string }) {
  const text = `${error.code ?? ""} ${error.message}`.toLowerCase();
  if (error.status === 429 || text.includes("rate limit")) {
    return "Too many sign-in emails. Try again in a few minutes.";
  }
  if (text.includes("email") && (text.includes("invalid") || text.includes("valid"))) {
    return "That doesn't look like an email address.";
  }
  return "Something went wrong. Please try again.";
}

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function signInWithGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setError(friendlyError(error));
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("That doesn't look like an email address.");
      return;
    }
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });
    setSending(false);
    if (error) setError(friendlyError(error));
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center lg:text-left">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card bg-you-light text-you lg:mx-0">
          <MailIcon />
        </div>
        <h2 className="mt-4 text-2xl">Check your email</h2>
        <p className="mt-2">
          We sent a sign-in link to <span className="font-medium">{email.trim()}</span>
        </p>
        <p className="mt-2 text-muted">
          Open it on this device to sign in. It can take a minute. Check spam if you
          don&apos;t see it.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 min-h-[44px] text-sm text-you underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl">Sign in to Teamingful</h2>
      <p className="mt-1 text-muted">Free for researchers.</p>

      <div className="mt-6 space-y-4">
        {GOOGLE_SIGNIN_ENABLED && (
          <>
            <button onClick={signInWithGoogle} className="btn w-full">
              Continue with Google
            </button>
            <p className="text-center text-sm text-muted">or</p>
          </>
        )}

        <form onSubmit={sendLink} className="space-y-3" noValidate>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              aria-label="Email address"
              aria-invalid={error ? true : undefined}
              className={`input ${error ? "border-them" : ""}`}
            />
            {error && <p className="mt-1 text-sm text-them-text">{error}</p>}
          </div>
          <button type="submit" disabled={sending} className="btn w-full disabled:opacity-60">
            {sending ? "Sending..." : "Email me a sign-in link"}
          </button>
        </form>

        <p className="text-sm text-muted">
          We&apos;ll send a link that signs you in. No password to remember.
        </p>
      </div>
    </div>
  );
}
