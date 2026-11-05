type ApiErrorShape = {
  status?: unknown;
  message?: unknown;
  error?: unknown;
  data?: unknown;
  errors?: unknown;
  response?: { status?: unknown; data?: unknown };
};

function safeMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const message = value.trim();
  if (!message || message === '[object Object]' || /^(failed to fetch|network error|fetch failed|rejected|internal server error\.?|request failed(?: \(\d+\))?|unexpected error)$/i.test(message)) return null;
  if (/^<!doctype|^<html/i.test(message) || message.length > 500) return null;
  return message;
}

export function getApiErrorMessage(error: unknown, fallback = 'The request could not be completed. Please try again.') {
  const object = error && typeof error === 'object' ? error as ApiErrorShape : {};
  const data = object.data && typeof object.data === 'object' ? object.data as ApiErrorShape : {};
  const response = object.response?.data && typeof object.response.data === 'object' ? object.response.data as ApiErrorShape : {};
  const status = Number(object.status || object.response?.status || data.status || response.status);
  const errorSources = [data.errors, response.errors, object.errors];
  const fieldMessages = errorSources.flatMap((items) => {
    if (Array.isArray(items)) return items.flatMap((item: any) => {
      const message = safeMessage(item?.message);
      return message ? [(safeMessage(item?.field) ? safeMessage(item.field) + ': ' : '') + message] : [];
    });
    if (items && typeof items === 'object') {
      return Object.entries(items).flatMap(([field, messages]) =>
        (Array.isArray(messages) ? messages : [messages])
          .map((message) => safeMessage(message))
          .filter((message): message is string => Boolean(message))
          .map((message) => field + ': ' + message)
      );
    }
    return [];
  });
  if (fieldMessages.length) return fieldMessages.slice(0, 4).join(' · ');
  const message = safeMessage(data.message) || safeMessage(response.message) || safeMessage(object.message) ||
    safeMessage(data.error) || safeMessage(response.error) || safeMessage(object.error);
  if (message) return message;
  if (status === 401) return 'Your session has expired. Sign in again to continue.';
  if (status === 403) return 'You do not have permission to complete this action.';
  if (status === 404) return 'The requested record could not be found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'A server error occurred. Please try again shortly.';
  if (object.status === 'FETCH_ERROR' || object.status === 'TIMEOUT_ERROR') return 'The service could not be reached. Check your connection and try again.';
  return fallback;
}

export function getApiSuccessMessage(response: unknown, fallback: string) {
  if (!response || typeof response !== 'object') return fallback;
  const object = response as ApiErrorShape;
  const data = object.data && typeof object.data === 'object' ? object.data as ApiErrorShape : {};
  return safeMessage(object.message) || safeMessage(data.message) || fallback;
}

let fetchNormalizerInstalled = false;

export function installApiErrorNormalization() {
  if (typeof window === 'undefined' || fetchNormalizerInstalled) return;
  fetchNormalizerInstalled = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    if (response.ok) return response;
    const rawUrl = input instanceof Request ? input.url : String(input);
    let isApiRequest = false;
    try { isApiRequest = new URL(rawUrl, window.location.href).pathname.includes('/api/'); } catch {}
    if (!isApiRequest) return response;
    const body = await response.clone().json().catch(() => ({}));
    const message = getApiErrorMessage({ status: response.status, data: body });
    const normalized = body && typeof body === 'object' ? { ...body, message } : { success: false, message };
    return new Response(JSON.stringify(normalized), {
      status: response.status,
      statusText: response.statusText,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
