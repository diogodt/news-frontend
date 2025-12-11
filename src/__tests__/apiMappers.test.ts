import { mapUser, login, register, refreshAccessToken, requestPasswordReset, resetPassword } from "../api/auth";
import { searchNews, fetchSearchHistory } from "../api/news";
import {
  addArticleToCollection,
  fetchCollections,
  fetchCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  removeArticleFromCollection,
} from "../api/collections";

jest.mock("../api/client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const apiClient = require("../api/client").apiClient as {
  post: jest.Mock;
  get: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

describe("API mappers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("maps user with fallbacks", () => {
    const user = mapUser({ id: 1, email: "a", name: "b", language: "en" });
    expect(user.languages).toEqual(["en"]);
    const empty = mapUser({});
    expect(empty.email).toBe("");
  });

  it("maps news articles from search", async () => {
    apiClient.get.mockResolvedValue({
      data: {
        articles: [
          {
            url: "http://x",
            title: "t",
            description: "d",
            content: null,
            source: { name: "src" },
            urlToImage: "img",
          },
        ],
        totalResults: 1,
      },
    });
    const result = await searchNews("topic", 1, 20, "relevancy");
    expect(result.articles[0].source).toBe("src");
    expect(result.totalResults).toBe(1);
  });

  it("maps collections and articles", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: "c1",
          article_count: 1,
          articles: [{ url: "u", title: "t" }],
        },
      ],
    });
    const cols = await fetchCollections();
    expect(cols[0].articleCount).toBe(1);
    expect(cols[0].articles[0].publishedAt).toBeUndefined();

    apiClient.get.mockResolvedValueOnce({ data: { id: 2, name: "c2", description: null, articles: [{ url: "u2", title: "t2" }] } });
    const col = await fetchCollection(2);
    expect(col.articles[0].title).toBe("t2");
    expect(col.articleCount).toBe(1);

    apiClient.get.mockResolvedValueOnce({
      data: { id: 4, name: "c4", articles: [{ url: "u4", title: "t4", publishedAt: "2024-02-02", imageUrl: "img" }] },
    });
    const colRich = await fetchCollection(4);
    expect(colRich.articles[0].publishedAt).toBe("2024-02-02");
    expect(colRich.articles[0].imageUrl).toBe("img");

    apiClient.post.mockResolvedValueOnce({
      data: { id: 10, url: "u", title: "t", published_at: "2024-01-01" },
    });
    const article = await addArticleToCollection(1, { url: "u", title: "t" });
    expect(article.publishedAt).toBe("2024-01-01");

    apiClient.post.mockResolvedValueOnce({ data: { id: 3, name: "c3", description: "d" } });
    const newCol = await createCollection({ name: "c3", description: "d" });
    expect(newCol.name).toBe("c3");

    apiClient.put.mockResolvedValueOnce({ data: { id: 3, name: "c3 updated", description: "d2" } });
    const updated = await updateCollection(3, { name: "c3 updated", description: "d2" });
    expect(updated.description).toBe("d2");

    apiClient.delete.mockResolvedValue({});
    await deleteCollection(3);
    await removeArticleFromCollection(1, 10);
  });

  it("auth endpoints map correctly", async () => {
    apiClient.post
      .mockResolvedValueOnce({ data: { user: { id: 1, email: "a", name: "A" }, tokens: { access_token: "t", token_type: "bearer" } } })
      .mockResolvedValueOnce({ data: { user: { id: 2, email: "b", name: "B" }, tokens: { access_token: "t2", token_type: "bearer" } } })
      .mockResolvedValueOnce({ data: { reset_token: "rt" } })
      .mockResolvedValueOnce({ data: {} }) // reset password
      .mockResolvedValueOnce({ data: { access_token: "refresh" } });
    const auth1 = await login({ email: "a", password: "p" });
    const auth2 = await register({ email: "b", password: "p", name: "B" });
    expect(auth1.user.email).toBe("a");
    expect(auth2.user.email).toBe("b");
    const token = await requestPasswordReset("a");
    expect(token).toBeDefined();
    await resetPassword("token", "new");

    const refreshed = await refreshAccessToken();
    expect(refreshed).toBe("refresh");
  });

  it("covers auth mapping defaults", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { user: { id: 3, email: "c", name: "C", favorite_topics: ["ai"], languages: ["en", "pt"] } } });
    const { user } = await register({ email: "c", password: "p", name: "C" });
    expect(user.favoriteTopics).toEqual(["ai"]);
    expect(user.languages).toEqual(["en", "pt"]);

    apiClient.post.mockResolvedValueOnce({ data: { user: { id: 4, email: "d", name: "D", favoriteTopics: ["defi"], language: "es" }, tokens: {} } });
    const mapped = await login({ email: "d", password: "p" });
    expect(mapped.tokens.accessToken).toBe("");
    expect(mapped.user.languages).toEqual(["es"]);

    apiClient.post.mockResolvedValueOnce({ data: {} });
    const nullRefresh = await refreshAccessToken();
    expect(nullRefresh).toBeNull();
  });

  it("searches news and history", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        articles: [
          { url: "http://x", title: "t", description: "d", source: "s", published_at: "2024-01-02", image_url: "img" },
        ],
        totalResults: 1,
      },
    });
    const result = await searchNews("topic", 2, 10, "publishedAt", "2024-01-01", "2024-01-10");
    expect(result.articles[0].source).toBe("s");
    expect(result.articles[0].publishedAt).toBe("2024-01-02");
    expect(apiClient.get).toHaveBeenLastCalledWith("/news/search", {
      params: { topic: "topic", page: 2, page_size: 10, sort_by: "publishedAt", from_date: "2024-01-01", to_date: "2024-01-10" },
    });

    apiClient.get.mockResolvedValueOnce({ data: { items: ["AI", "crypto"] } });
    const history = await fetchSearchHistory();
    expect(history).toEqual(["AI", "crypto"]);
  });
});
