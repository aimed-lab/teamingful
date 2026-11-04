// Simple placeholder used by screens that are not built yet.
export default function PlaceholderScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-2xl">{title}</h1>
      <p className="mt-2 text-muted">{description}</p>
    </div>
  );
}
