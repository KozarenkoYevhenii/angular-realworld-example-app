import { apiFetch } from './client';
import type { Profile } from '../models';

export async function getProfile(username: string, signal?: AbortSignal): Promise<Profile> {
  const data = await apiFetch<{ profile: Profile }>(`/profiles/${username}`, { signal });
  return data.profile;
}

export async function followUser(username: string, signal?: AbortSignal): Promise<Profile> {
  const data = await apiFetch<{ profile: Profile }>(`/profiles/${username}/follow`, {
    method: 'POST',
    body: JSON.stringify({}),
    signal,
  });
  return data.profile;
}

export async function unfollowUser(username: string, signal?: AbortSignal): Promise<Profile> {
  const data = await apiFetch<{ profile: Profile }>(`/profiles/${username}/follow`, {
    method: 'DELETE',
    signal,
  });
  return data.profile;
}
