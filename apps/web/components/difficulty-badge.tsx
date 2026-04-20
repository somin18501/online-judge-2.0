import { Difficulty } from '@au/types';
import { Badge } from '@/components/ui/badge';

const MAP: Record<
  Difficulty,
  { label: string; variant: 'success' | 'warning' | 'destructive' }
> = {
  [Difficulty.EASY]: { label: 'Easy', variant: 'success' },
  [Difficulty.MEDIUM]: { label: 'Medium', variant: 'warning' },
  [Difficulty.HARD]: { label: 'Hard', variant: 'destructive' },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }): JSX.Element {
  const { label, variant } = MAP[difficulty];
  return <Badge variant={variant}>{label}</Badge>;
}
