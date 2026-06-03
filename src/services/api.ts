export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

export async function apiFetch<T>(input: RequestInfo, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(input, init);
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      const payload = contentType?.includes('application/json') ? await response.json() : await response.text();
      return { data: null, error: typeof payload === 'string' ? payload : JSON.stringify(payload) };
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return { data, error: null };
    }

    return { data: null, error: 'Unexpected response format.' };
  } catch (error) {
    return { data: null, error: (error as Error)?.message || 'Network request failed.' };
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  return apiFetch<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}
