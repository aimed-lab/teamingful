import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase sends the user back here after Google or email sign-in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/today`);
  }

  return NextResponse.redirect(`${origin}/signin`);
}
