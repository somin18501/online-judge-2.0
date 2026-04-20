import type {
  AuthResponse,
  CreateSubmissionInput,
  Paginated,
  ProblemDetail,
  ProblemListItem,
  PublicUser,
  RunCodeInput,
  RunCodeResponse,
  SampleTestCase,
  SessionResponse,
  SubmissionDetail,
  SubmissionListItem,
} from '@au/types';
import { apiClient } from './client';

export interface ProblemListParams {
  q?: string;
  difficulty?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export const api = {
  auth: {
    signup: async (input: { email: string; username: string; password: string }) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/signup', input);
      return data;
    },
    login: async (input: { email: string; password: string }) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', input);
      return data;
    },
    logout: async () => {
      await apiClient.post('/auth/logout');
    },
    session: async () => {
      const { data } = await apiClient.get<SessionResponse>('/auth/session');
      return data;
    },
  },
  users: {
    me: async () => {
      const { data } = await apiClient.get<PublicUser>('/users/me');
      return data;
    },
  },
  problems: {
    list: async (params: ProblemListParams = {}) => {
      const { data } = await apiClient.get<Paginated<ProblemListItem>>('/problems', { params });
      return data;
    },
    getBySlug: async (slug: string) => {
      const { data } = await apiClient.get<ProblemDetail>(`/problems/${slug}`);
      return data;
    },
    mine: async () => {
      const { data } = await apiClient.get<ProblemListItem[]>('/problems/mine');
      return data;
    },
    getForEdit: async (id: string) => {
      const { data } = await apiClient.get<
        ProblemDetail & { hiddenTestCases: SampleTestCase[] }
      >(`/problems/by-id/${id}/edit`);
      return data;
    },
    create: async (body: unknown) => {
      const { data } = await apiClient.post<ProblemDetail>('/problems', body);
      return data;
    },
    update: async (id: string, body: unknown) => {
      const { data } = await apiClient.put<ProblemDetail>(`/problems/${id}`, body);
      return data;
    },
    remove: async (id: string) => {
      await apiClient.delete(`/problems/${id}`);
    },
  },
  submissions: {
    list: async (params: Record<string, string | number | undefined> = {}) => {
      const { data } = await apiClient.get<Paginated<SubmissionListItem>>('/submissions', {
        params,
      });
      return data;
    },
    create: async (body: CreateSubmissionInput) => {
      const { data } = await apiClient.post<SubmissionListItem>('/submissions', body);
      return data;
    },
    getById: async (id: string) => {
      const { data } = await apiClient.get<SubmissionDetail>(`/submissions/${id}`);
      return data;
    },
  },
  execution: {
    run: async (body: RunCodeInput) => {
      const { data } = await apiClient.post<RunCodeResponse>('/execution/run', body);
      return data;
    },
  },
};
