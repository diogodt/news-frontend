import { apiClient } from "./client";
import type { Article, NewsSearchResult } from "../types";

type RawNewsArticle = Partial<{
  id: number;
  url: string;
  title: string;
  description: string | null;
  content: string | null;
  source: { name?: string } | string | null;
  author: string | null;
  publishedAt: string | null;
  published_at: string | null;
  urlToImage: string | null;
  image_url: string | null;
}>;

const toArticle = (item: RawNewsArticle): Article => ({
  id: item.id,
  url: item.url ?? "",
  title: item.title ?? "",
  description: item.description ?? null,
  content: item.content || item.description || null,
  source: typeof item.source === "string" ? item.source : item.source?.name || null,
  author: item.author ?? null,
  publishedAt: item.publishedAt || item.published_at || undefined,
  imageUrl: item.urlToImage || item.image_url || undefined,
});

export const searchNews = async (
  topic: string,
  page = 1,
  pageSize = 20,
  sortBy: "relevancy" | "publishedAt" = "relevancy",
  from?: string,
  to?: string
): Promise<NewsSearchResult> => {
  const { data } = await apiClient.get("/news/search", { params: { topic, page, page_size: pageSize, sort_by: sortBy, from_date: from, to_date: to } });
  const mappedArticles = (data.articles || []).map(toArticle);
  return { articles: mappedArticles, totalResults: data.totalResults ?? mappedArticles.length };
};

export const fetchSearchHistory = async (): Promise<string[]> => {
  const { data } = await apiClient.get("/news/history");
  return data.items || [];
};
