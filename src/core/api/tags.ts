import { apiFetch } from './client';

export async function getTags(signal?: AbortSignal): Promise<string[]> {
  const data = await apiFetch<{ tags: string[] }>('/tags', { signal });
  return data.tags;
}
