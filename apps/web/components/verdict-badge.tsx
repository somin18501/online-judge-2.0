import { SubmissionStatus } from '@au/types';
import { Badge } from '@/components/ui/badge';

const MAP: Record<
  SubmissionStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' }
> = {
  [SubmissionStatus.QUEUED]: { label: 'Queued', variant: 'secondary' },
  [SubmissionStatus.RUNNING]: { label: 'Running', variant: 'info' },
  [SubmissionStatus.ACCEPTED]: { label: 'Accepted', variant: 'success' },
  [SubmissionStatus.WRONG_ANSWER]: { label: 'Wrong Answer', variant: 'destructive' },
  [SubmissionStatus.COMPILATION_ERROR]: { label: 'Compile Error', variant: 'destructive' },
  [SubmissionStatus.RUNTIME_ERROR]: { label: 'Runtime Error', variant: 'destructive' },
  [SubmissionStatus.TIME_LIMIT_EXCEEDED]: { label: 'Time Limit', variant: 'warning' },
  [SubmissionStatus.MEMORY_LIMIT_EXCEEDED]: { label: 'Memory Limit', variant: 'warning' },
  [SubmissionStatus.INTERNAL_ERROR]: { label: 'Internal Error', variant: 'destructive' },
};

export function VerdictBadge({ status }: { status: SubmissionStatus }): JSX.Element {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
