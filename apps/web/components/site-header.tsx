'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { LayoutDashboard, LogOut, Terminal } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function SiteHeader(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-foreground',
        pathname === href || (href !== '/' && pathname.startsWith(href))
          ? 'text-foreground'
          : 'text-muted-foreground',
      )}
    >
      {label}
    </Link>
  );

  const handleLogout = async (): Promise<void> => {
    await logout();
    toast({ title: 'Signed out', description: 'See you next time.' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Terminal className="h-5 w-5 text-primary" />
            <span>Online Judge</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLink('/problems', 'Problems')}
            {user ? navLink('/dashboard', 'Dashboard') : null}
            {user ? navLink('/dashboard/submissions', 'Submissions') : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === 'ready' && user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {user.username}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : null}
          {status === 'ready' && !user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
