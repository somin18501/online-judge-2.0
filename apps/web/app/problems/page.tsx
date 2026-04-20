import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Paginated, ProblemListItem } from '@au/types';
import { serverFetch } from '@/lib/api/server';
import { ProblemFilters } from '@/features/problems/problem-filters';
import { ProblemList } from '@/features/problems/problem-list';
import { PaginationBar } from '@/features/problems/pagination-bar';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Problems',
  description: 'Browse coding problems across difficulties and languages.',
};

interface SearchParams {
  q?: string;
  difficulty?: string;
  sort?: string;
  page?: string;
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<JSX.Element> {
  const query = {
    q: searchParams.q,
    difficulty: searchParams.difficulty,
    sort: searchParams.sort,
    page: searchParams.page,
    pageSize: '20',
  };

  const problems = await serverFetch<Paginated<ProblemListItem>>('/problems', { query });

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
          <p className="text-sm text-muted-foreground">
            {problems.meta.total} problem{problems.meta.total === 1 ? '' : 's'} available to solve.
          </p>
        </div>
        <Link href="/dashboard/problems/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New problem
          </Button>
        </Link>
      </div>

      <ProblemFilters />

      <ProblemList problems={problems} />

      <PaginationBar
        page={problems.meta.page}
        totalPages={problems.meta.totalPages}
        hasNext={problems.meta.hasNext}
        hasPrev={problems.meta.hasPrev}
      />
    </div>
  );
}
