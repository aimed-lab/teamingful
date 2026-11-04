"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Start event mode. Only one event can be active, so end any others first.
export async function startEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  await supabase
    .from("events")
    .update({ is_active: false })
    .eq("owner_id", user.id)
    .eq("is_active", true);

  await supabase.from("events").insert({
    owner_id: user.id,
    name: String(formData.get("name") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim() || null,
    starts_on:
      String(formData.get("starts_on") ?? "") || new Date().toISOString().slice(0, 10),
    ends_on: String(formData.get("ends_on") ?? "") || null,
    is_active: true,
  });

  revalidatePath("/", "layout");
}

// End the active event.
export async function endEvent() {
  const supabase = await createClient();
  await supabase.from("events").update({ is_active: false }).eq("is_active", true);
  revalidatePath("/", "layout");
}

// Save the name / title / organization on the Me screen.
export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: String(formData.get("full_name") ?? "").trim() || null,
    title: String(formData.get("title") ?? "").trim() || null,
    organization: String(formData.get("organization") ?? "").trim() || null,
  });

  revalidatePath("/", "layout");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}
