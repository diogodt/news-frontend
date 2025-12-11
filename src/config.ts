// Force production API endpoint to avoid falling back to localhost during dev/refresh flows
export const API_BASE_URL = "https://news-backend-tahw.onrender.com/api";

// no-op setter kept for compatibility
export const setApiBaseUrl = (_url: string): void => {
  // intentionally ignored
};
