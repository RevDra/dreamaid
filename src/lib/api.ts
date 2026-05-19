// Token stored in localStorage under this key
const TOKEN_KEY = 'ba_ide_token';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Diagram {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DiagramSummary {
  id: string;
  title: string;
  updated_at: string;
}

export interface ShareLinkResponse {
  token: string;
  url: string;
}

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearToken = (): void =>
  localStorage.removeItem(TOKEN_KEY);

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

// Auth
export const register = (email: string, password: string): Promise<AuthResponse> =>
  apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });

export const login = (email: string, password: string): Promise<AuthResponse> =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const me = (): Promise<User> =>
  apiFetch('/auth/me');

// Diagrams
export const listDiagrams = (): Promise<DiagramSummary[]> =>
  apiFetch('/diagrams');

export const createDiagram = (title: string, content: string): Promise<Diagram> =>
  apiFetch('/diagrams', { method: 'POST', body: JSON.stringify({ title, content }) });

export const getDiagram = (id: string): Promise<Diagram> =>
  apiFetch(`/diagrams/${id}`);

export const updateDiagram = (
  id: string,
  data: { title?: string; content?: string }
): Promise<Diagram> =>
  apiFetch(`/diagrams/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDiagram = (id: string): Promise<void> =>
  apiFetch(`/diagrams/${id}`, { method: 'DELETE' });

// Sharing
export const createShareLink = (
  diagramId: string,
  permission: 'read' | 'edit'
): Promise<ShareLinkResponse> =>
  apiFetch(`/diagrams/${diagramId}/share`, {
    method: 'POST',
    body: JSON.stringify({ permission }),
  });

// Export — returns a URL to open directly (binary response)
export const exportUrl = (diagramId: string, format: 'svg' | 'png'): string =>
  `/api/diagrams/${diagramId}/export?format=${format}`;
