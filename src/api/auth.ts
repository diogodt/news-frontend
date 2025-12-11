import { apiClient } from "./client";
import type { AuthResponse, UserProfile } from "../types";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  country?: string;
  language?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post("/auth/register", payload);
  return normalizeAuthResponse(data);
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post("/auth/login", payload);
  return normalizeAuthResponse(data);
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const { data } = await apiClient.post("/auth/refresh");
  return data?.access_token || null;
};

export const requestPasswordReset = async (email: string) => {
  const { data } = await apiClient.post("/auth/request-reset", { email });
  return data?.reset_token as string | undefined;
};

export const resetPassword = async (token: string, newPassword: string) => {
  await apiClient.post("/auth/reset", { token, new_password: newPassword });
};

type RawUser = Partial<{
  id: number;
  email: string;
  name: string;
  country: string | null;
  language: string;
  languages: string[] | null;
  favorite_topics: string[];
  favoriteTopics: string[];
  news_api_token?: string | null;
}>;

interface RawAuthResponse {
  user?: RawUser | null;
  tokens?: { access_token?: string; token_type?: string };
}

const normalizeAuthResponse = (payload: RawAuthResponse): AuthResponse => ({
  user: mapUser(payload.user ?? {}),
  tokens: {
    accessToken: payload.tokens?.access_token ?? "",
    tokenType: payload.tokens?.token_type ?? "bearer",
  },
});

export const mapUser = (user: RawUser): UserProfile => ({
  id: user.id ?? 0,
  email: user.email ?? "",
  name: user.name ?? "",
  country: user.country ?? null,
  languages: user.languages ?? (user.language ? [user.language] : []),
  favoriteTopics: user.favorite_topics ?? user.favoriteTopics ?? [],
  newsApiToken: user.news_api_token ?? null,
});
