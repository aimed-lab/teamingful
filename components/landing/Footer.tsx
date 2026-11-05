import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-6 py-10 text-sm text-muted lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <p>Teamingful is made at the UAB Systems Pharmacology AI Research Center.</p>
      <nav className="flex gap-2" aria-label="Footer">
        <Link href="/privacy" className="inline-flex min-h-[44px] items-center px-2 hover:text-ink hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="inline-flex min-h-[44px] items-center px-2 hover:text-ink hover:underline">
          Terms
        </Link>
        <a
          href="mailto:smartdrugdiscovery@gmail.com"
          className="inline-flex min-h-[44px] items-center px-2 hover:text-ink hover:underline"
        >
          Contact
        </a>
      </nav>
    </footer>
  );
}
