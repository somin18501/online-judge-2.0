export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-2 md:flex-row">
        <p className="text-sm text-muted-foreground">
          AU Online Judge — built with Next.js, NestJS, Prisma, and Docker.
        </p>
        <p className="text-xs text-muted-foreground">
          Portfolio demo project. Not for production use without hardening.
        </p>
      </div>
    </footer>
  );
}
