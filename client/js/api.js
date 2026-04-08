/* ══════════════════════════════════════
   API.js — Frontend API Calls
══════════════════════════════════════ */
const API = (() => {
  const BASE = '/api';

  const getToken = () => localStorage.getItem('pv_token');

  const headers = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...extra,
  });

  const request = async (method, endpoint, body = null) => {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  return {
    get: (ep) => request('GET', ep),
    post: (ep, b) => request('POST', ep, b),
    put: (ep, b) => request('PUT', ep, b),
    delete: (ep) => request('DELETE', ep),
    getToken,
    setToken: (t) => localStorage.setItem('pv_token', t),
    clearToken: () => localStorage.removeItem('pv_token'),
  };
})();
