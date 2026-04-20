'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Difficulty, ProblemVisibility, Schemas } from '@au/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api/endpoints';
import { apiErrorMessage } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface Props {
  mode: 'create' | 'edit';
  problemId?: string;
  defaultValues?: Partial<Schemas.ProblemFormInput>;
}

export function ProblemForm({ mode, problemId, defaultValues }: Props): JSX.Element {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<Schemas.ProblemFormInput>({
    resolver: zodResolver(Schemas.problemFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      statement: '',
      constraints: '',
      examples: [],
      difficulty: Difficulty.EASY,
      visibility: ProblemVisibility.PUBLISHED,
      sampleTestCases: [{ input: '', expectedOutput: '' }],
      hiddenTestCases: [{ input: '', expectedOutput: '' }],
      ...defaultValues,
    },
  });

  const examples = useFieldArray({ control: form.control, name: 'examples' });
  const samples = useFieldArray({ control: form.control, name: 'sampleTestCases' });
  const hidden = useFieldArray({ control: form.control, name: 'hiddenTestCases' });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const payload = {
        ...values,
        slug: values.slug?.trim() || undefined,
        constraints: values.constraints?.trim() || undefined,
      };
      if (mode === 'create') {
        const created = await api.problems.create(payload);
        toast({ title: 'Problem created', description: created.title });
        router.push('/dashboard/problems');
      } else if (problemId) {
        const updated = await api.problems.update(problemId, payload);
        toast({ title: 'Problem updated', description: updated.title });
        router.push('/dashboard/problems');
      }
      router.refresh();
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Could not save the problem'));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basics</CardTitle>
          <CardDescription>Title, slug, difficulty, and visibility.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register('title')} />
            <FormError message={form.formState.errors.title?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input id="slug" placeholder="auto-generated if empty" {...form.register('slug')} />
            <FormError message={form.formState.errors.slug?.message} />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={form.watch('difficulty')}
              onValueChange={(v) => form.setValue('difficulty', v as Difficulty)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Difficulty).map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={form.watch('visibility')}
              onValueChange={(v) => form.setValue('visibility', v as ProblemVisibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProblemVisibility).map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statement</CardTitle>
          <CardDescription>Markdown-style text rendered as plain text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statement">Problem statement</Label>
            <Textarea
              id="statement"
              rows={8}
              {...form.register('statement')}
              className="font-mono text-sm"
            />
            <FormError message={form.formState.errors.statement?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="constraints">Constraints (optional)</Label>
            <Textarea
              id="constraints"
              rows={4}
              {...form.register('constraints')}
              className="font-mono text-sm"
            />
            <FormError message={form.formState.errors.constraints?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Examples</CardTitle>
            <CardDescription>Shown on the problem page alongside the statement.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => examples.append({ input: '', output: '' })}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add example
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {examples.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No examples yet.</p>
          ) : null}
          {examples.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
              <Textarea
                placeholder="Input"
                className="font-mono text-xs"
                {...form.register(`examples.${index}.input` as const)}
              />
              <Textarea
                placeholder="Expected output"
                className="font-mono text-xs"
                {...form.register(`examples.${index}.output` as const)}
              />
              <Textarea
                placeholder="Explanation (optional)"
                rows={2}
                className="md:col-span-2"
                {...form.register(`examples.${index}.explanation` as const)}
              />
              <div className="md:col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => examples.remove(index)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <TestCaseSection
        title="Sample test cases"
        description="Visible to users. Used as default input when running code."
        fields={samples.fields}
        onAdd={() => samples.append({ input: '', expectedOutput: '' })}
        onRemove={(i) => samples.remove(i)}
        register={(i, key) => form.register(`sampleTestCases.${i}.${key}` as const)}
        errorMessage={form.formState.errors.sampleTestCases?.message}
      />

      <TestCaseSection
        title="Hidden test cases"
        description="Used for scoring submissions. Never shown to users."
        fields={hidden.fields}
        onAdd={() => hidden.append({ input: '', expectedOutput: '' })}
        onRemove={(i) => hidden.remove(i)}
        register={(i, key) => form.register(`hiddenTestCases.${i}.${key}` as const)}
        errorMessage={form.formState.errors.hiddenTestCases?.message}
      />

      {submitError ? <FormError message={submitError} /> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {mode === 'create' ? 'Create problem' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function TestCaseSection({
  title,
  description,
  fields,
  onAdd,
  onRemove,
  register,
  errorMessage,
}: {
  title: string;
  description: string;
  fields: { id: string }[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  register: (i: number, key: 'input' | 'expectedOutput') => ReturnType<
    ReturnType<typeof useForm>['register']
  >;
  errorMessage?: string;
}): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormError message={errorMessage} />
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
            <Textarea
              placeholder="Input"
              className="font-mono text-xs"
              rows={4}
              {...register(index, 'input')}
            />
            <Textarea
              placeholder="Expected output"
              className="font-mono text-xs"
              rows={4}
              {...register(index, 'expectedOutput')}
            />
            <div className="md:col-span-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
