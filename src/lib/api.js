import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE || '/api';
const normalizedBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

const api = axios.create({
  baseURL: normalizedBase,
  withCredentials: true,
});

export const apiBaseURL = normalizedBase;

export const apiOrigin = (() => {
  if (typeof window === 'undefined') return '';
  try {
    const url = new URL(normalizedBase, window.location.origin);
    url.pathname = url.pathname.replace(/\/api$/, '');
    const cleanedPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
    return `${url.origin}${cleanedPath}`;
  } catch {
    return '';
  }
})();

export const buildUploadsUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!apiOrigin) return normalized;
  return `${apiOrigin}${normalized}`;
};

export default api;
