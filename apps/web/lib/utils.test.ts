import { describe, it, expect } from 'vitest';
import { cn, formatRuntime, formatDate, formatDateTime } from './utils';

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toContain('px-4');
    expect(cn('text-sm', undefined, false && 'hidden', 'font-bold')).toBe('text-sm font-bold');
  });
});

describe('formatRuntime', () => {
  it('formats runtime in ms', () => {
    expect(formatRuntime(null)).toBe('—');
    expect(formatRuntime(0)).toBe('0 ms');
    expect(formatRuntime(123)).toBe('123 ms');
  });
});

describe('formatDate / formatDateTime', () => {
  it('produces non-empty strings', () => {
    const iso = '2025-01-15T10:20:30.000Z';
    expect(formatDate(iso)).toMatch(/2025/);
    expect(formatDateTime(iso)).toMatch(/2025/);
  });
});
