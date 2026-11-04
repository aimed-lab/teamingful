"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Google sign-in is hidden until the Google provider is set up in Supabase.
const GOOGLE_SIGNIN_ENABLED = false;

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function signInWithGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setMessage(error.message);
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-12">
      <h1 className="font-heading text-4xl text-green">Teamingful</h1>
      <p className="mt-2 text-muted">Everyone you meet, as teams.</p>

      <div className="mt-10 space-y-4">
        {GOOGLE_SIGNIN_ENABLED && (
          <>
            <button onClick={signInWithGoogle} className="btn w-full">
              Continue with Google
            </button>

            <p className="text-center text-sm text-muted">or</p>
          </>
        )}

        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="input"
          />
          <button type="submit" className="btn-outline w-full">
            Email me a sign-in link
          </button>
        </form>

        {message && <p className="text-sm text-muted">{message}</p>}
      </div>
    </main>
  );
}
