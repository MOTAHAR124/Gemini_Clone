import { API_URL } from './config';
import { ApiError } from './errors';

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const json = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(json.message)) {
        message = json.message.join(', ');
      } else if (json.message) {
        message = json.message;
      }
    } catch {
      // Ignore JSON parse failures for non-JSON responses.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
