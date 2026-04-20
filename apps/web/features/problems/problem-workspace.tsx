'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, Send } from 'lucide-react';
import {
  LANGUAGE_DISPLAY,
  Language,
  SUPPORTED_LANGUAGES,
  SubmissionStatus,
  TERMINAL_SUBMISSION_STATUSES,
  type ProblemDetail,
  type RunCodeResponse,
  type SubmissionDetail,
} from '@au/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VerdictBadge } from '@/components/verdict-badge';
import { CodeEditor } from '@/features/editor/code-editor';
import { STARTER_CODE } from '@/features/editor/starter-code';
import { useEditorPrefs } from '@/store/editor-store';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api/endpoints';
import { apiErrorMessage } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';
import { formatRuntime } from '@/lib/utils';

interface Props {
  problem: ProblemDetail;
}

export function ProblemWorkspace({ problem }: Props): JSX.Element {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { language, setLanguage, fontSize, wordWrap } = useEditorPrefs();
  const codeKey = useMemo(() => `au.code.${problem.id}.${language}`, [problem.id, language]);

  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>(problem.sampleTestCases[0]?.input ?? '');
  const [runOutput, setRunOutput] = useState<RunCodeResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);

  // Load persisted code when language or problem changes.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(codeKey) : null;
    setCode(stored ?? STARTER_CODE[language]);
  }, [codeKey, language]);

  useEffect(() => {
    if (typeof window !== 'undefined' && code) {
      localStorage.setItem(codeKey, code);
    }
  }, [codeKey, code]);

  const handleRun = async (): Promise<void> => {
    setIsRunning(true);
    setRunOutput(null);
    try {
      const res = await api.execution.run({ language, sourceCode: code, stdin });
      setRunOutput(res);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to run',
        description: apiErrorMessage(err, 'Could not run your code'),
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!user) {
      toast({
        title: 'Sign in to submit',
        description: 'Create an account or log in to submit solutions.',
      });
      router.push(`/login?redirect=/problems/${problem.slug}`);
      return;
    }
    setIsSubmitting(true);
    setSubmission(null);
    try {
      const created = await api.submissions.create({
        problemId: problem.id,
        language,
        sourceCode: code,
      });
      toast({ title: 'Submission created', description: 'Judging in progress…' });
      await pollSubmission(created.id, (s) => setSubmission(s));
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: apiErrorMessage(err, 'Could not submit your solution'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-lg">Editor</CardTitle>
            <CardDescription>Write and run your solution.</CardDescription>
          </div>
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as Language)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {LANGUAGE_DISPLAY[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            fontSize={fontSize}
            wordWrap={wordWrap}
            height="420px"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRun} disabled={isRunning} variant="outline">
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Custom input</CardTitle>
            <CardDescription>Piped to your program on stdin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="h-32 font-mono text-xs"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Type or paste input here…"
            />
          </CardContent>
        </Card>

        {runOutput ? <RunOutputCard output={runOutput} /> : null}
        {submission ? <SubmissionCard submission={submission} /> : null}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sample test cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {problem.sampleTestCases.map((sample, i) => (
              <div key={sample.id} className="rounded-md border bg-muted/30 p-3 text-xs">
                <p className="mb-1 font-medium">Sample {i + 1}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono">
                    <span className="block text-[10px] uppercase text-muted-foreground">
                      Input
                    </span>
                    {sample.input || '(empty)'}
                  </pre>
                  <pre className="whitespace-pre-wrap rounded bg-background p-2 font-mono">
                    <span className="block text-[10px] uppercase text-muted-foreground">
                      Expected
                    </span>
                    {sample.expectedOutput}
                  </pre>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RunOutputCard({ output }: { output: RunCodeResponse }): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3 space-y-0">
        <CardTitle className="text-lg">Run result</CardTitle>
        <VerdictBadge status={output.status} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Runtime: {formatRuntime(output.runtimeMs)}
          {output.exitCode !== null ? ` · Exit ${output.exitCode}` : ''}
        </p>
        {output.stdout ? (
          <Block label="stdout" content={output.stdout} />
        ) : null}
        {output.stderr ? (
          <Block label="stderr" content={output.stderr} tone="error" />
        ) : null}
        {!output.stdout && !output.stderr ? (
          <p className="text-sm text-muted-foreground">(no output)</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SubmissionCard({ submission }: { submission: SubmissionDetail }): JSX.Element {
  const { passedTestCases, totalTestCases } = submission;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3 space-y-0">
        <div>
          <CardTitle className="text-lg">Latest submission</CardTitle>
          <CardDescription>
            {totalTestCases
              ? `${passedTestCases ?? 0}/${totalTestCases} tests passed`
              : 'Judging…'}
          </CardDescription>
        </div>
        <VerdictBadge status={submission.status} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Runtime: {formatRuntime(submission.runtimeMs)}
        </p>
        {submission.errorMessage ? (
          <p className="text-xs text-destructive">{submission.errorMessage}</p>
        ) : null}
        {submission.stderrSummary ? (
          <Block label="stderr" content={submission.stderrSummary} tone="error" />
        ) : null}
      </CardContent>
    </Card>
  );
}

function Block({
  label,
  content,
  tone,
}: {
  label: string;
  content: string;
  tone?: 'error';
}): JSX.Element {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <pre
        className={`mt-1 max-h-48 overflow-auto rounded border bg-muted/40 p-2 font-mono text-xs ${
          tone === 'error' ? 'text-destructive' : ''
        }`}
      >
        {content}
      </pre>
    </div>
  );
}

async function pollSubmission(
  id: string,
  onUpdate: (s: SubmissionDetail) => void,
): Promise<SubmissionDetail | null> {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const detail = await api.submissions.getById(id);
      onUpdate(detail);
      if (TERMINAL_SUBMISSION_STATUSES.includes(detail.status as SubmissionStatus)) {
        return detail;
      }
    } catch {
      // ignore transient errors
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return null;
}
