import { ProblemForm } from '@/features/problems/problem-form';

export const metadata = { title: 'New problem' };

export default function NewProblemPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">New problem</h1>
        <p className="text-sm text-muted-foreground">
          Create a new coding problem with sample and hidden test cases.
        </p>
      </header>
      <ProblemForm mode="create" />
    </div>
  );
}
