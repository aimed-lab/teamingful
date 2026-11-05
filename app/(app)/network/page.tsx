import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import { NetworkIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Network · Teamingful" };

export default function NetworkPage() {
  return (
    <EmptyState
      icon={<NetworkIcon />}
      title="Your network grows with every team"
      text="Once you have a few teams, you'll see how everyone connects."
      action={{ label: "Capture someone", href: "/capture" }}
    />
  );
}

