import Link from 'next/link';
import type { Paginated, SubmissionListItem } from '@au/types';
import { serverFetch } from '@/lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerdictBadge } from '@/components/verdict-badge';
import { formatDateTime, formatRuntime } from '@/lib/utils';

export const metadata = { title: 'My submissions' };

interface SearchParams {
  page?: string;
}

export default async function MySubmissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<JSX.Element> {
  const data = await serverFetch<Paginated<SubmissionListItem>>('/submissions', {
    query: { page: searchParams.page, pageSize: 20 },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">My submissions</h1>
        <p className="text-sm text-muted-foreground">
          {data.meta.total} total submission{data.meta.total === 1 ? '' : 's'}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent</CardTitle>
        </CardHeader>
        <CardContent>
          {data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t submitted any solutions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Problem</th>
                    <th className="py-2 pr-4">Language</th>
                    <th className="py-2 pr-4">Runtime</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {formatDateTime(s.createdAt)}
                      </td>
                      <td className="py-2 pr-4">
                        <Link className="hover:underline" href={`/problems/${s.problemSlug}`}>
                          {s.problemTitle}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{s.language}</td>
                      <td className="py-2 pr-4">{formatRuntime(s.runtimeMs)}</td>
                      <td className="py-2 pr-4">
                        <VerdictBadge status={s.status} />
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
