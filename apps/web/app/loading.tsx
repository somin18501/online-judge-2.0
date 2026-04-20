import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): JSX.Element {
  return (
    <div className="container space-y-4 py-10">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-5 w-96" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
