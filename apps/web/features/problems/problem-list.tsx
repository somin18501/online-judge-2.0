import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ProblemListItem, Paginated } from '@au/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { formatDate } from '@/lib/utils';

export function ProblemList({
  problems,
}: {
  problems: Paginated<ProblemListItem>;
}): JSX.Element {
  if (problems.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-base font-medium">No problems match your filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing the search or picking a different difficulty.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {problems.items.map((problem) => (
        <Link key={problem.id} href={`/problems/${problem.slug}`}>
          <Card className="group h-full transition-colors hover:border-primary/40 hover:shadow-md">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base">{problem.title}</CardTitle>
                <CardDescription className="text-xs">
                  By {problem.author.username} · {formatDate(problem.createdAt)}
                </CardDescription>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="font-mono text-xs text-muted-foreground">/{problem.slug}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
