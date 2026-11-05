import Link from "next/link";
import TeamMark from "./TeamMark";

// Mark + lowercase wordmark. Links to `href`.
export default function Logo({
  href = "/",
  size = "sm",
  light = false,
}: {
  href?: string;
  size?: "sm" | "md";
  light?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex min-h-[44px] items-center gap-2" aria-label="teamingful home">
      <TeamMark size={size} />
      <span
        className={`font-heading text-lg font-semibold sm:text-xl tracking-tight ${light ? "text-white" : "text-ink"}`}
      >
        teamingful
      </span>
    </Link>
  );
}
