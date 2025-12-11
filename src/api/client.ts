import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let getAccessToken: (() => string | null) | null = null;
let refreshToken: (() => Promise<string | null>) | null = null;
let handleLogout: (() => void) | null = null;

export const attachAuthInterceptors = (
  handlers: {
    getToken: () => string | null;
    refresh: () => Promise<string | null>;
    logout: () => void;
  },
  client: AxiosInstance = apiClient
) => {
  getAccessToken = handlers.getToken;
  refreshToken = handlers.refresh;
  handleLogout = handlers.logout;

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken?.();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalConfig = (error.config || {}) as InternalAxiosRequestConfig & { _retry?: boolean };
      const isRefreshCall = (originalConfig.url || "").includes("/auth/refresh");
      if (error.response?.status === 401 && !originalConfig._retry && !isRefreshCall) {
        originalConfig._retry = true;
        try {
          const newToken = await refreshToken?.();
          if (newToken) {
            originalConfig.headers = originalConfig.headers ?? {};
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            return client(originalConfig);
          }
        } catch {
          handleLogout?.();
        }
      }
      return Promise.reject(error);
    }
  );
};
