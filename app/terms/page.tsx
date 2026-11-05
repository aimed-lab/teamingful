import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";

export const metadata: Metadata = { title: "Terms · Teamingful" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>
        Teamingful is an early access research tool from the UAB Systems Pharmacology AI
        Research Center. It is free to use during this period and may change as we learn from
        researchers using it. Formal terms of use will be published here before the public launch.
      </p>
      <p>Questions? Write to smartdrugdiscovery@gmail.com.</p>
    </LegalPage>
  );
}
