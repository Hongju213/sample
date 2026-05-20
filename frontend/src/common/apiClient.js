import { useAuthStore } from '../store/authStore.js';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function resolveApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

function getAuthHeader() {
  const { username, password } = useAuthStore.getState();

  if (!username && !password) {
    return {};
  }

  return {
    Authorization: `Basic ${window.btoa(`${username}:${password}`)}`
  };
}

export async function fetchJson(path, options = {}) {
  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} ${text.slice(0, 200)}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
