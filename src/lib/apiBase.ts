/**
 * Basis URL API.
 * - Produksi: kosongkan VITE_API_URL agar memakai origin halaman (satu domain).
 * - Development: default ke backend lokal port 5000.
 */
export const apiBaseUrl = (): string => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured !== undefined && configured !== null && String(configured).trim() !== "") {
    return String(configured).replace(/\/$/, "");
  }
  if (import.meta.env.DEV) return "http://localhost:5000";
  return window.location.origin;
};

export const apiUrl = (path: string): string =>
  `${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
