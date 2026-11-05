import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";

export const metadata: Metadata = { title: "Privacy · Teamingful" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        Teamingful is in early access. Your photos, voice notes and notes are private to you.
        Only what you choose to put on a shared team is visible to the other person. A full
        privacy policy will be published here before the public launch.
      </p>
      <p>Questions about your data? Write to smartdrugdiscovery@gmail.com.</p>
    </LegalPage>
  );
}
