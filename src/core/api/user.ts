import { apiFetch } from './client';
import type { User } from '../models';

export function loginUser(credentials: { email: string; password: string }, signal?: AbortSignal) {
  return apiFetch<{ user: User }>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ user: credentials }),
    signal,
  });
}

export function registerUser(credentials: { username: string; email: string; password: string }, signal?: AbortSignal) {
  return apiFetch<{ user: User }>('/users', {
    method: 'POST',
    body: JSON.stringify({ user: credentials }),
    signal,
  });
}

export function getCurrentUser(signal?: AbortSignal) {
  return apiFetch<{ user: User }>('/user', { signal });
}

export function updateUser(user: Partial<User>, signal?: AbortSignal) {
  return apiFetch<{ user: User }>('/user', {
    method: 'PUT',
    body: JSON.stringify({ user }),
    signal,
  });
}
