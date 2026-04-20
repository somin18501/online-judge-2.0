'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaginationBar({
  page,
  totalPages,
  hasNext,
  hasPrev,
}: {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const go = (target: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set('page', String(target));
    router.push(`?${sp.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => go(page - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => go(page + 1)}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
