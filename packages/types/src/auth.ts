import type { UserRole } from './enums';

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface SessionResponse {
  user: PublicUser | null;
}

export interface AuthResponse {
  user: PublicUser;
}
