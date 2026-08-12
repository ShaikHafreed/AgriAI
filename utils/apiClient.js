// utils/apiClient.js
// fetch() wrapper for the in-repo Cloudflare Worker (utils/apiConfig.js WORKER_BASE_URL).
// Attaches the current Firebase ID token to every request and, on a 401, forces a
// token refresh and retries once — the equivalent of a silent-refresh interceptor,
// except Firebase's SDK already owns rotating the underlying refresh token, so this
// only needs to ask it for a fresh ID token rather than implementing rotation itself.
//
// Not used for the separate agriai-diagnose-v2 Worker (utils/apiConfig.js
// DIAGNOSE_WORKER_BASE_URL) — its source lives outside this repo and doesn't verify
// this header yet.

import { auth } from '../firebaseConfig';
import { ensureAnonAuth } from './taskManager';

async function getAuthHeader(forceRefresh = false) {
  if (!auth.currentUser) await ensureAnonAuth();
  const token = await auth.currentUser.getIdToken(forceRefresh);
  return `Bearer ${token}`;
}

// Same signature as fetch(), for the Worker endpoints that require auth.
export async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), Authorization: await getAuthHeader() };
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const retryHeaders = { ...(options.headers || {}), Authorization: await getAuthHeader(true) };
    response = await fetch(url, { ...options, headers: retryHeaders });
  }

  return response;
}
