import { getToken } from '../auth/jwt';
import type { Errors } from '../models';

const API_BASE = 'https://api.realworld.show/api';

const NETWORK_ERRORS = {
  network: ['Unable to connect. Please check your internet connection.'],
};

export class ApiError implements Errors {
  errors: Record<string, unknown>;
  status: number;

  constructor(errors: Record<string, unknown>, status: number) {
    this.errors = errors;
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function onUnauthorized(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') || (err instanceof Error && err.name === 'AbortError')
  );
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (err) {
    if (isAbortError(err)) {
      throw err;
    }
    throw new ApiError(NETWORK_ERRORS, 0);
  }

  if (response.status === 401 && !url.endsWith('/user')) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    let body: { errors?: Record<string, unknown> } | null = null;
    try {
      body = (await response.json()) as { errors?: Record<string, unknown> };
    } catch {
      body = null;
    }

    const errors = body && typeof body === 'object' && body.errors ? body.errors : NETWORK_ERRORS;

    throw new ApiError(errors, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(NETWORK_ERRORS, response.status);
  }
}
