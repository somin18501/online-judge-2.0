import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ProblemListItem } from '@au/types';
import { serverFetch } from '@/lib/api/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { ProblemRowActions } from '@/features/problems/problem-row-actions';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'My problems' };

export default async function MyProblemsPage(): Promise<JSX.Element> {
  const problems = await serverFetch<ProblemListItem[]>('/problems/mine').catch(() => []);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My problems</h1>
          <p className="text-sm text-muted-foreground">
            {problems.length} authored problem{problems.length === 1 ? '' : 's'}.
          </p>
        </div>
        <Link href="/dashboard/problems/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            New problem
          </Button>
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All problems</CardTitle>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">You haven&apos;t authored any problems yet.</p>
              <Link href="/dashboard/problems/new">
                <Button className="mt-4">Create your first problem</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Difficulty</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2 pr-4">
                        <Link className="font-medium hover:underline" href={`/problems/${p.slug}`}>
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        <DifficultyBadge difficulty={p.difficulty} />
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <ProblemRowActions problemId={p.id} problemTitle={p.title} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
