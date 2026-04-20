import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProblemDetail } from '@au/types';
import { serverFetch, ServerFetchError } from '@/lib/api/server';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { ProblemWorkspace } from '@/features/problems/problem-workspace';

interface Props {
  params: { slug: string };
}

async function loadProblem(slug: string): Promise<ProblemDetail | null> {
  try {
    return await serverFetch<ProblemDetail>(`/problems/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ServerFetchError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const problem = await loadProblem(params.slug);
  if (!problem) return { title: 'Problem not found' };
  return {
    title: problem.title,
    description: problem.statement.slice(0, 160),
  };
}

export default async function ProblemDetailPage({ params }: Props): Promise<JSX.Element> {
  const problem = await loadProblem(params.slug);
  if (!problem) notFound();

  return (
    <div className="container space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <p className="text-xs text-muted-foreground">
            By {problem.author.username} · /{problem.slug}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <article className="space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Problem
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{problem.statement}</div>
          </section>

          {problem.constraints ? (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Constraints
              </h2>
              <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-mono text-xs">
                {problem.constraints}
              </pre>
            </section>
          ) : null}

          {problem.examples.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Examples
              </h2>
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="mb-2 text-xs font-medium">Example {i + 1}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono text-xs">
                      <span className="block text-[10px] uppercase text-muted-foreground">
                        Input
                      </span>
                      {ex.input}
                    </pre>
                    <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono text-xs">
                      <span className="block text-[10px] uppercase text-muted-foreground">
                        Output
                      </span>
                      {ex.output}
                    </pre>
                  </div>
                  {ex.explanation ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {ex.explanation}
                    </p>
                  ) : null}
                </div>
              ))}
            </section>
          ) : null}

          {problem.sampleTestCases.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Sample test cases
              </h2>
              {problem.sampleTestCases.map((sample, i) => (
                <div key={sample.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="mb-2 text-xs font-medium">Sample {i + 1}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono text-xs">
                      <span className="block text-[10px] uppercase text-muted-foreground">
                        Input
                      </span>
                      {sample.input || '(empty)'}
                    </pre>
                    <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono text-xs">
                      <span className="block text-[10px] uppercase text-muted-foreground">
                        Expected
                      </span>
                      {sample.expectedOutput}
                    </pre>
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </article>

        <ProblemWorkspace problem={problem} />
      </div>
    </div>
  );
}
