import { apiClient } from "./client";
import type { UserProfile } from "../types";
import { mapUser } from "./auth";

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get("/me");
  return mapUser(data);
};

export interface UpdateProfilePayload {
  name?: string;
  country?: string;
  languages?: string[];
  favoriteTopics?: string[];
  newsApiToken?: string;
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  const body = {
    name: payload.name,
    country: payload.country,
    languages: payload.languages,
    favorite_topics: payload.favoriteTopics,
    news_api_token: payload.newsApiToken,
  };
  const { data } = await apiClient.put("/me", body);
  return mapUser(data);
};
