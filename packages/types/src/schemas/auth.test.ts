import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, passwordSchema, usernameSchema } from './auth';

describe('passwordSchema', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(passwordSchema.safeParse('abc123').success).toBe(false);
  });
  it('rejects passwords missing numbers', () => {
    expect(passwordSchema.safeParse('onlyLetters').success).toBe(false);
  });
  it('rejects passwords missing letters', () => {
    expect(passwordSchema.safeParse('12345678').success).toBe(false);
  });
  it('accepts a valid password', () => {
    expect(passwordSchema.safeParse('hunter2-password').success).toBe(true);
  });
});

describe('usernameSchema', () => {
  it('rejects usernames with invalid characters', () => {
    expect(usernameSchema.safeParse('hello world').success).toBe(false);
    expect(usernameSchema.safeParse('a!b').success).toBe(false);
  });
  it('accepts kebab/snake/alphanumeric usernames', () => {
    expect(usernameSchema.safeParse('alice_01').success).toBe(true);
    expect(usernameSchema.safeParse('bob-the-coder').success).toBe(true);
  });
});

describe('signupSchema', () => {
  it('normalizes email to lowercase', () => {
    const parsed = signupSchema.parse({
      email: 'Test@Example.COM',
      username: 'tester',
      password: 'abcdef12',
    });
    expect(parsed.email).toBe('test@example.com');
  });
});

describe('loginSchema', () => {
  it('accepts any non-empty password', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success,
    ).toBe(true);
  });
  it('rejects empty password', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.co', password: '' }).success,
    ).toBe(false);
  });
});
