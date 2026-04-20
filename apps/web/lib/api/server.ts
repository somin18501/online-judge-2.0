import 'server-only';
import { cookies } from 'next/headers';
import { INTERNAL_API_URL } from './config';

export interface ServerFetchOptions extends RequestInit {
  forwardCookies?: boolean;
  query?: Record<string, string | number | undefined>;
}

/**
 * Server-side fetch wrapper for Server Components / route handlers.
 * Automatically forwards the incoming request's cookies so authenticated
 * Server Component renders see the user's session.
 */
export async function serverFetch<T>(path: string, init: ServerFetchOptions = {}): Promise<T> {
  const { forwardCookies = true, query, headers, ...rest } = init;

  const url = new URL(path.startsWith('http') ? path : `${INTERNAL_API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');
  if (!finalHeaders.has('Content-Type') && rest.body) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (forwardCookies) {
    const cookieHeader = cookies().toString();
    if (cookieHeader) finalHeaders.set('cookie', cookieHeader);
  }

  const res = await fetch(url.toString(), {
    ...rest,
    headers: finalHeaders,
    cache: rest.cache ?? 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ServerFetchError(res.status, text || res.statusText, url.toString());
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ServerFetchError extends Error {
  constructor(
    public status: number,
    public body: string,
    public url: string,
  ) {
    super(`Server fetch ${status} -> ${url}: ${body}`);
    this.name = 'ServerFetchError';
  }
}
