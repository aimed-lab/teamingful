// Round blue avatar with initials.
export default function Avatar({ text, size = "md" }: { text: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full bg-you font-heading font-medium text-white`}
    >
      {text}
    </span>
  );
}
