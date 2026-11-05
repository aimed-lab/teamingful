import Link from "next/link";
import Logo from "@/components/Logo";

// Simple page for Privacy and Terms.
export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-8">
      <Logo />
      <h1 className="mt-10 text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
      <div className="mt-4 space-y-4 text-muted">{children}</div>
      <Link href="/" className="mt-8 inline-flex min-h-[44px] items-center text-you underline">
        Back to home
      </Link>
    </main>
  );
}
