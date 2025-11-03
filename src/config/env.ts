const rawBackendUrl = (
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.BACKEND_URL ??
  ""
).trim();

const normalizedBackendUrl = rawBackendUrl.endsWith("/")
  ? rawBackendUrl.slice(0, -1)
  : rawBackendUrl;

export const BACKEND_URL = normalizedBackendUrl;

export const resolveApiUrl = (path: string) => {
  if (!BACKEND_URL) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${normalizedPath}`;
};
