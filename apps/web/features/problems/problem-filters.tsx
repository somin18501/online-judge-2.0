'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Difficulty } from '@au/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All difficulties' },
  { value: Difficulty.EASY, label: 'Easy' },
  { value: Difficulty.MEDIUM, label: 'Medium' },
  { value: Difficulty.HARD, label: 'Hard' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'difficulty', label: 'Difficulty' },
];

export function ProblemFilters(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (q) sp.set('q', q);
      else sp.delete('q');
      sp.delete('page');
      startTransition(() => router.push(`/problems?${sp.toString()}`));
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const updateParam = (key: string, value: string | undefined) => {
    const sp = new URLSearchParams(params.toString());
    if (!value || value === 'all') sp.delete(key);
    else sp.set(key, value);
    sp.delete('page');
    startTransition(() => router.push(`/problems?${sp.toString()}`));
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search problems by title or slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="w-full md:w-48">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Difficulty</label>
        <Select
          value={params.get('difficulty') ?? 'all'}
          onValueChange={(v) => updateParam('difficulty', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-48">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort</label>
        <Select
          value={params.get('sort') ?? 'newest'}
          onValueChange={(v) => updateParam('sort', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
