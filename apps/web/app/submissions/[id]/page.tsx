import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { SubmissionDetail } from '@au/types';
import { serverFetch, ServerFetchError } from '@/lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerdictBadge } from '@/components/verdict-badge';
import { formatDateTime, formatRuntime } from '@/lib/utils';

export const metadata = { title: 'Submission' };

interface Props {
  params: { id: string };
}

export default async function SubmissionPage({ params }: Props): Promise<JSX.Element> {
  let submission: SubmissionDetail;
  try {
    submission = await serverFetch<SubmissionDetail>(`/submissions/${params.id}`);
  } catch (err) {
    if (err instanceof ServerFetchError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Submission</h1>
          <p className="text-sm text-muted-foreground">
            <Link className="hover:underline" href={`/problems/${submission.problemSlug}`}>
              {submission.problemTitle}
            </Link>
            {' · '}
            {formatDateTime(submission.createdAt)}
          </p>
        </div>
        <VerdictBadge status={submission.status} />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Language" value={submission.language} />
        <Stat label="Runtime" value={formatRuntime(submission.runtimeMs)} />
        <Stat
          label="Tests"
          value={`${submission.passedTestCases ?? 0}/${submission.totalTestCases ?? 0}`}
        />
      </div>

      {submission.errorMessage || submission.stderrSummary ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
              {submission.errorMessage || submission.stderrSummary}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
            <code>{submission.sourceCode}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
