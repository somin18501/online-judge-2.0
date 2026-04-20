import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { serverFetch, ServerFetchError } from '@/lib/api/server';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AuthBootstrap } from '@/components/auth-bootstrap';
import type { SessionResponse } from '@au/types';
import { APP_URL } from '@/lib/api/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'AU Online Judge',
    template: '%s · AU Online Judge',
  },
  description:
    'Modern online judge platform for practicing coding problems in C, C++, Python, and JavaScript.',
  openGraph: {
    title: 'AU Online Judge',
    description:
      'Practice coding problems, run code against custom input, and submit solutions against hidden test cases.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AU Online Judge',
  },
};

export const dynamic = 'force-dynamic';

async function loadInitialSession(): Promise<SessionResponse> {
  try {
    return await serverFetch<SessionResponse>('/auth/session');
  } catch (err) {
    if (err instanceof ServerFetchError) {
      console.warn('[layout] session fetch failed:', err.status, err.body);
    }
    return { user: null };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await loadInitialSession();
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthBootstrap initialUser={session.user} />
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
