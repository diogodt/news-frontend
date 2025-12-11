type GlobalWithApi = typeof globalThis & { __APP_API_URL__?: string };

const globalApi = (globalThis as GlobalWithApi).__APP_API_URL__;

export const API_BASE_URL: string = globalApi || "http://localhost:8000/api";

export const setApiBaseUrl = (url: string): void => {
  (globalThis as GlobalWithApi).__APP_API_URL__ = url;
};
