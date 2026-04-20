import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_URL } from './config';

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
}

/**
 * Browser-side axios instance. Uses `withCredentials` so the backend's
 * HttpOnly session cookie is included on every request.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorBody>;
    const body = axiosErr.response?.data;
    if (body) {
      if (Array.isArray(body.message)) return body.message.join('\n');
      if (typeof body.message === 'string') return body.message;
      if (typeof body.error === 'string') return body.error;
    }
    return axiosErr.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
