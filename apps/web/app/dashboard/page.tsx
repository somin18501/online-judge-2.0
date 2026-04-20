import Link from 'next/link';
import type { Paginated, ProblemListItem, SubmissionListItem } from '@au/types';
import { serverFetch } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Dashboard' };

export default async function DashboardOverviewPage(): Promise<JSX.Element> {
  const [submissions, problems] = await Promise.all([
    serverFetch<Paginated<SubmissionListItem>>('/submissions', { query: { pageSize: 5 } }).catch(
      () => ({ items: [], meta: { total: 0 } as never }),
    ),
    serverFetch<ProblemListItem[]>('/problems/mine').catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your recent submissions and authored problems.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent submissions</CardTitle>
            <CardDescription>{submissions.items.length} shown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {submissions.items.length === 0 ? (
              <p className="text-muted-foreground">No submissions yet.</p>
            ) : (
              submissions.items.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b py-2 last:border-0">
                  <Link className="truncate hover:underline" href={`/problems/${s.problemSlug}`}>
                    {s.problemTitle}
                  </Link>
                  <span className="text-xs text-muted-foreground">{s.status}</span>
                </div>
              ))
            )}
            <div className="pt-2">
              <Link href="/dashboard/submissions">
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My problems</CardTitle>
            <CardDescription>Problems you&apos;ve authored.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {problems.length === 0 ? (
              <p className="text-muted-foreground">You haven&apos;t authored any problems yet.</p>
            ) : (
              problems.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b py-2 last:border-0">
                  <Link className="truncate hover:underline" href={`/problems/${p.slug}`}>
                    {p.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">{p.difficulty}</span>
                </div>
              ))
            )}
            <div className="flex gap-2 pt-2">
              <Link href="/dashboard/problems">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
              <Link href="/dashboard/problems/new">
                <Button size="sm">New problem</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
