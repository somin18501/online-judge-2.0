export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? API_URL;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
