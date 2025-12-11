import { apiClient } from "./client";
import type { Article, Collection } from "../types";

type RawArticle = Partial<{
  id: number;
  url: string;
  title: string;
  description: string | null;
  source: string | null;
  author: string | null;
  published_at: string | null;
  publishedAt: string | null;
  image_url: string | null;
  imageUrl: string | null;
}>;

type RawCollection = Partial<{
  id: number;
  name: string;
  description: string | null;
  article_count: number;
  articles: RawArticle[];
}>;

const toArticle = (item: RawArticle): Article => ({
  id: item.id,
  url: item.url ?? "",
  title: item.title ?? "",
  description: item.description ?? null,
  source: item.source ?? null,
  author: item.author ?? null,
  publishedAt: item.published_at || item.publishedAt || undefined,
  imageUrl: item.image_url || item.imageUrl || undefined,
});

const toCollection = (item: RawCollection): Collection => ({
  id: item.id ?? 0,
  name: item.name ?? "",
  description: item.description ?? null,
  articleCount: item.article_count ?? (item.articles ? item.articles.length : 0),
  articles: item.articles ? item.articles.map(toArticle) : [],
});

export const fetchCollections = async (): Promise<Collection[]> => {
  const { data } = await apiClient.get("/collections");
  return data.map(toCollection);
};

export const fetchCollection = async (collectionId: number): Promise<Collection> => {
  const { data } = await apiClient.get(`/collections/${collectionId}`);
  return toCollection(data);
};

export const createCollection = async (payload: { name: string; description?: string }): Promise<Collection> => {
  const { data } = await apiClient.post("/collections", payload);
  return toCollection(data);
};

export const updateCollection = async (
  collectionId: number,
  payload: { name?: string; description?: string }
): Promise<Collection> => {
  const { data } = await apiClient.put(`/collections/${collectionId}`, payload);
  return toCollection(data);
};

export const deleteCollection = async (collectionId: number): Promise<void> => {
  await apiClient.delete(`/collections/${collectionId}`);
};

export const addArticleToCollection = async (collectionId: number, article: Article): Promise<Article> => {
  const { data } = await apiClient.post(`/collections/${collectionId}/articles`, {
    url: article.url,
    title: article.title,
    description: article.description,
    source: article.source,
    author: article.author,
    published_at: article.publishedAt,
    image_url: article.imageUrl,
  });
  return toArticle(data);
};

export const removeArticleFromCollection = async (collectionId: number, articleId: number): Promise<void> => {
  await apiClient.delete(`/collections/${collectionId}/articles/${articleId}`);
};
