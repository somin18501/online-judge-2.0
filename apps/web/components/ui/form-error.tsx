import { cn } from '@/lib/utils';

export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}): JSX.Element | null {
  if (!message) return null;
  return (
    <p className={cn('text-xs font-medium text-destructive', className)} role="alert">
      {message}
    </p>
  );
}
