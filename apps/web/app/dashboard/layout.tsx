import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { SessionResponse } from '@au/types';
import { serverFetch } from '@/lib/api/server';
import { cn } from '@/lib/utils';

const DASHBOARD_LINKS: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/submissions', label: 'My submissions' },
  { href: '/dashboard/problems', label: 'My problems' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  let session: SessionResponse = { user: null };
  try {
    session = await serverFetch<SessionResponse>('/auth/session');
  } catch {
    session = { user: null };
  }
  if (!session.user) {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <div className="container grid gap-6 py-10 md:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="space-y-2">
        <div className="px-2 pb-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
          <p className="font-medium">{session.user.username}</p>
          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {DASHBOARD_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
