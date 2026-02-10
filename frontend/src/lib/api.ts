const DEFAULT_API_BASE = 'http://localhost:4000/api';

function normalizeApiBase(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_API_BASE;

  const ensureApiPath = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.pathname === '/' || parsed.pathname === '') {
        parsed.pathname = '/api';
      }
      return parsed.toString().replace(/\/$/, '');
    } catch {
      return url.replace(/\/$/, '');
    }
  };

  if (/^https?:\/\//i.test(value)) {
    return ensureApiPath(value);
  }

  // Handle values like "website-production.up.railway.app" or "/website-production.up.railway.app"
  const withoutLeadingSlash = value.replace(/^\/+/, '');
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(withoutLeadingSlash)) {
    return ensureApiPath(`https://${withoutLeadingSlash}`);
  }

  // Allow relative values while keeping same-origin API.
  if (value.startsWith('/')) {
    return `${window.location.origin}${value}`.replace(/\/$/, '');
  }

  return value.replace(/\/$/, '');
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

type ApiOptions = RequestInit & { token?: string | null };

type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error: ApiError = {
      message: isJson ? payload?.message || 'Error en la solicitud' : String(payload || 'Error en la solicitud'),
      status: response.status,
      details: isJson ? payload : undefined,
    };
    throw error;
  }

  return payload as T;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}
