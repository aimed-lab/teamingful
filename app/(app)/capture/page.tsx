import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import { CameraIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Capture · Teamingful" };

export default function CapturePage() {
  return (
    <EmptyState
      icon={<CameraIcon />}
      title="Capture is coming next"
      text="Soon you'll snap a card or hold to talk here."
    />
  );
}

