export interface UserProfile {
  id: number;
  email: string;
  name: string;
  country?: string | null;
  languages?: string[] | null;
  favoriteTopics?: string[];
  newsApiToken?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface Article {
  id?: number;
  url: string;
  title: string;
  description?: string | null;
  content?: string | null;
  source?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
}

export interface Collection {
  id: number;
  name: string;
  description?: string | null;
  articles?: Article[];
  articleCount?: number;
}

export interface NewsSearchResult {
  articles: Article[];
  totalResults: number;
}
