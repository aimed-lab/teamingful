// Public share page. Built in a later step; the proxy already leaves /t/* open.
export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await params;
  return (
    <main className="mx-auto max-w-[480px] px-6 py-12">
      <h1 className="font-heading text-2xl text-green">Teamingful</h1>
      <p className="mt-2 text-muted">
        The shared slides and promises will show here.
      </p>
    </main>
  );
}
