import Link from 'next/link';
import { ArrowRight, Code2, Lock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage(): JSX.Element {
  return (
    <div className="container flex flex-col gap-16 py-16">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          C · C++ · Python · JavaScript
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Practice coding. Run safely.{' '}
          <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
            Submit with confidence.
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          AU Online Judge is a modern full-stack coding platform. Browse problems, write code in a
          proper editor, and submit solutions evaluated against hidden test cases inside isolated
          sandboxes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/problems">
            <Button size="lg">
              Browse problems
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Create an account
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Code2 className="mb-2 h-6 w-6 text-primary" />
            <CardTitle>Multi-language editor</CardTitle>
            <CardDescription>Write in C, C++, Python, or JavaScript.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A Monaco-powered editor with persistent preferences, sample test cases, and custom
            stdin.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Server className="mb-2 h-6 w-6 text-primary" />
            <CardTitle>Isolated execution</CardTitle>
            <CardDescription>Docker sandboxes with strict limits.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Each submission runs in a disposable container with no network, capped CPU and memory,
            and dropped Linux capabilities.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Lock className="mb-2 h-6 w-6 text-primary" />
            <CardTitle>Production-style auth</CardTitle>
            <CardDescription>DB-backed sessions with HttpOnly cookies.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Argon2-hashed passwords, server-side session revocation, and role-aware guards. No
            tokens in local storage.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
