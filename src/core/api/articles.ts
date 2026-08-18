import { apiFetch } from './client';
import type { Article, ArticleListConfig } from '../models';

export function queryArticles(config: ArticleListConfig, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(config.filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  const path = `/articles${config.type === 'feed' ? '/feed' : ''}${query ? `?${query}` : ''}`;
  return apiFetch<{ articles: Article[]; articlesCount: number }>(path, { signal });
}

export async function getArticle(slug: string, signal?: AbortSignal): Promise<Article> {
  const data = await apiFetch<{ article: Article }>(`/articles/${slug}`, { signal });
  return data.article;
}

export function deleteArticle(slug: string, signal?: AbortSignal) {
  return apiFetch<void>(`/articles/${slug}`, { method: 'DELETE', signal });
}

export async function createArticle(article: Partial<Article>, signal?: AbortSignal): Promise<Article> {
  const data = await apiFetch<{ article: Article }>('/articles', {
    method: 'POST',
    body: JSON.stringify({ article }),
    signal,
  });
  return data.article;
}

export async function updateArticle(
  article: Partial<Article> & { slug: string },
  signal?: AbortSignal,
): Promise<Article> {
  const data = await apiFetch<{ article: Article }>(`/articles/${article.slug}`, {
    method: 'PUT',
    body: JSON.stringify({ article }),
    signal,
  });
  return data.article;
}

export async function favoriteArticle(slug: string, signal?: AbortSignal): Promise<Article> {
  const data = await apiFetch<{ article: Article }>(`/articles/${slug}/favorite`, {
    method: 'POST',
    body: JSON.stringify({}),
    signal,
  });
  return data.article;
}

export function unfavoriteArticle(slug: string, signal?: AbortSignal) {
  return apiFetch<void>(`/articles/${slug}/favorite`, { method: 'DELETE', signal });
}
