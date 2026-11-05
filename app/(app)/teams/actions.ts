"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Tick or untick a promise on the team page.
export async function togglePromise(promiseId: string, teamId: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("promises").update({ done }).eq("id", promiseId);
  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/", "layout");
}
