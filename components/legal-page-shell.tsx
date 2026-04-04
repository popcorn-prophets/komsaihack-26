import Header from '@/components/header';

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-svh bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-5 py-10 pb-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>
        <div className="legal-doc space-y-6 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
      </article>
    </main>
  );
}
