'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Schemas } from '@au/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/ui/form-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiErrorMessage } from '@/lib/api/client';
import { api } from '@/lib/api/endpoints';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';

export function SignupForm(): JSX.Element {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<Schemas.SignupInput>({
    resolver: zodResolver(Schemas.signupSchema),
    defaultValues: { email: '', username: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const res = await api.auth.signup(values);
      setUser(res.user);
      toast({ title: 'Account created', description: `Welcome, ${res.user.username}!` });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Could not create your account'));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Sign up to save submissions and author problems.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register('email')}
              aria-invalid={!!form.formState.errors.email}
            />
            <FormError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              {...form.register('username')}
              aria-invalid={!!form.formState.errors.username}
            />
            <FormError message={form.formState.errors.username?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
              aria-invalid={!!form.formState.errors.password}
            />
            <FormError message={form.formState.errors.password?.message} />
            <p className="text-xs text-muted-foreground">
              Minimum 8 characters with at least one letter and one number.
            </p>
          </div>
          {submitError ? <FormError message={submitError} /> : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
