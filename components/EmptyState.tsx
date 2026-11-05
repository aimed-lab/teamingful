import Link from "next/link";

// Centered card used by screens that have nothing to show yet.
// Pass `action` for a link button, or `children` for a custom action.
export default function EmptyState({
  icon,
  title,
  text,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="card mx-auto mt-6 max-w-md p-8 text-center lg:mt-16">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card bg-you-light text-you">
        {icon}
      </div>
      <h1 className="mt-4 text-xl">{title}</h1>
      <p className="mt-2 text-muted">{text}</p>
      {action && (
        <Link href={action.href} className="btn mt-6">
          {action.label}
        </Link>
      )}
      {children}
    </div>
  );
}
