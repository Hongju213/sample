import { fetchJson, resolveApiUrl } from '../common/apiClient.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const AGENT_BASE_URL = (import.meta.env.VITE_AGENT_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const AGENT_CALLBACK_BASE_URL = (import.meta.env.VITE_AGENT_CALLBACK_BASE_URL ?? API_BASE_URL).replace(/\/$/, '');

function resolveUrl(pathOrUrl, baseUrl = API_BASE_URL) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${baseUrl}${pathOrUrl}`;
}

async function fetchExternalJson(pathOrUrl, options, baseUrl = API_BASE_URL) {
  const url = resolveUrl(pathOrUrl, baseUrl);
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} ${url} ${text.slice(0, 120)}`);
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`API did not return JSON: ${url} content-type=${contentType} body=${text.slice(0, 120)}`);
  }

  return response.json();
}

export async function requestAgentBatch(method = 'GET') {
  if (!/^https?:\/\//i.test(AGENT_CALLBACK_BASE_URL)) {
    throw new Error('VITE_AGENT_CALLBACK_BASE_URL or VITE_API_BASE_URL must be an absolute backend URL.');
  }

  const callbackUrl = `${AGENT_CALLBACK_BASE_URL}/api/agent-test/callback`;
  const payload = {
    source: 'sample-frontend',
    message: `${method} request test`,
    callback_url: callbackUrl
  };

  if (method === 'POST') {
    return fetchExternalJson('/api/bat/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, AGENT_BASE_URL);
  }

  const searchParams = new URLSearchParams({
    source: payload.source,
    message: payload.message,
    callback_url: callbackUrl
  });

  return fetchExternalJson(`/api/bat/test?${searchParams.toString()}`, { method: 'GET' }, AGENT_BASE_URL);
}

export async function fetchAgentBatchStatus() {
  return fetchJson('/api/agent-test/status');
}

export function subscribeAgentBatchStatus(onStatus, onError) {
  const eventSource = new EventSource(resolveApiUrl('/api/agent-test/events'));

  eventSource.addEventListener('agent-status', event => {
    onStatus(JSON.parse(event.data));
  });

  eventSource.onerror = error => {
    onError?.(error);
  };

  return () => eventSource.close();
}
