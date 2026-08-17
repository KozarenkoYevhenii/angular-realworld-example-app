import { apiFetch } from './client';
import type { Comment } from '../models';

export async function getComments(slug: string, signal?: AbortSignal): Promise<Comment[]> {
  const data = await apiFetch<{ comments: Comment[] }>(`/articles/${slug}/comments`, { signal });
  return data.comments;
}

export async function addComment(slug: string, body: string, signal?: AbortSignal): Promise<Comment> {
  const data = await apiFetch<{ comment: Comment }>(`/articles/${slug}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment: { body } }),
    signal,
  });
  return data.comment;
}

export function deleteComment(slug: string, commentId: number, signal?: AbortSignal) {
  return apiFetch<void>(`/articles/${slug}/comments/${commentId}`, { method: 'DELETE', signal });
}
