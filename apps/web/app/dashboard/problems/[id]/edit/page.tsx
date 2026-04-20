import { notFound } from 'next/navigation';
import type { ProblemDetail, SampleTestCase } from '@au/types';
import { serverFetch, ServerFetchError } from '@/lib/api/server';
import { ProblemForm } from '@/features/problems/problem-form';

export const metadata = { title: 'Edit problem' };

interface Props {
  params: { id: string };
}

export default async function EditProblemPage({ params }: Props): Promise<JSX.Element> {
  let problem: (ProblemDetail & { hiddenTestCases: SampleTestCase[] }) | null = null;
  try {
    problem = await serverFetch<ProblemDetail & { hiddenTestCases: SampleTestCase[] }>(
      `/problems/by-id/${params.id}/edit`,
    );
  } catch (err) {
    if (err instanceof ServerFetchError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }
  if (!problem) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Edit problem</h1>
        <p className="text-sm text-muted-foreground">Update details, examples, and test cases.</p>
      </header>
      <ProblemForm
        mode="edit"
        problemId={problem.id}
        defaultValues={{
          title: problem.title,
          slug: problem.slug,
          statement: problem.statement,
          constraints: problem.constraints ?? '',
          examples: problem.examples,
          difficulty: problem.difficulty,
          visibility: problem.visibility,
          sampleTestCases: problem.sampleTestCases.map((t) => ({
            input: t.input,
            expectedOutput: t.expectedOutput,
            order: t.order,
          })),
          hiddenTestCases: problem.hiddenTestCases.map((t) => ({
            input: t.input,
            expectedOutput: t.expectedOutput,
            order: t.order,
          })),
        }}
      />
    </div>
  );
}
