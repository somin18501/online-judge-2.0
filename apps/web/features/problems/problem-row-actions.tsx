'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api/endpoints';
import { apiErrorMessage } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface Props {
  problemId: string;
  problemTitle: string;
}

export function ProblemRowActions({ problemId, problemTitle }: Props): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onConfirm = async (): Promise<void> => {
    setDeleting(true);
    try {
      await api.problems.remove(problemId);
      toast({ title: 'Problem deleted', description: problemTitle });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: apiErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={`/dashboard/problems/${problemId}/edit`}>
        <Button size="sm" variant="ghost">
          <Pencil className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </Link>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="text-destructive">
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete problem?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{problemTitle}</strong> and all associated test
              cases and submissions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
