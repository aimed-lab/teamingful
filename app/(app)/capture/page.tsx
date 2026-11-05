import type { Metadata } from "next";
import CaptureScreen from "@/components/capture/CaptureScreen";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Capture · Teamingful" };

export default async function CapturePage() {
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("name").eq("is_active", true).maybeSingle();
  return <CaptureScreen eventName={event?.name ?? null} />;
}
