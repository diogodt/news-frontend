import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { searchNews, fetchSearchHistory } from "../api/news";
import { addArticleToCollection, createCollection, fetchCollections, removeArticleFromCollection } from "../api/collections";
import type { Article, Collection } from "../types";
import { SearchBar } from "../components/SearchBar";
import { ArticleCard } from "../components/ArticleCard";
import { SaveDialog } from "../components/SaveDialog";
import { Loader } from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { useUndoableAction } from "../hooks/useUndoableAction";
import { UndoBar } from "../components/UndoBar";

type ErrorWithDetail = {
  response?: { data?: { detail?: string } };
  message?: string;
};

const parseErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const withDetail = error as ErrorWithDetail;
    const detail = withDetail.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (withDetail.message) return withDetail.message;
  }
  return "Could not load results.";
};

export const SearchPage = () => {
  const PAGE_SIZE = 100;
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"relevancy" | "publishedAt">("publishedAt");
  const [selectedFrom, setSelectedFrom] = useState<string | undefined>(undefined);
  const [selectedTo, setSelectedTo] = useState<string | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const undo = useUndoableAction();

  const { data: history = [], refetch: refetchHistory } = useQuery<string[]>({
    queryKey: ["search-history"],
    queryFn: fetchSearchHistory,
  });

  const { data: collections = [], isLoading: loadingCollections } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const addToCollection = useMutation({
    mutationFn: ({ collectionId, article }: { collectionId: number; article: Article }) =>
      addArticleToCollection(collectionId, article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
  const removeFromCollection = useMutation({
    mutationFn: ({ collectionId, articleId }: { collectionId: number; articleId: number }) =>
      removeArticleFromCollection(collectionId, articleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });

  const runSearch = async (
    term: string,
    fromOverride?: string,
    toOverride?: string,
    sortOverride?: "relevancy" | "publishedAt"
  ) => {
    if (!term.trim()) return;
    setIsFetching(true);
    setError(null);
    try {
      const fromStr = fromOverride ?? selectedFrom;
      const toStr = toOverride ?? selectedTo;
      const sort = sortOverride ?? sortBy;
      const collected: Article[] = [];
      let totalResults = 0;
      let page = 1;
      const pageSize = PAGE_SIZE;
      while (page <= 1) {
        const result = await searchNews(term.trim(), page, pageSize, sort, fromStr, toStr);
        totalResults = result.totalResults || totalResults || result.articles.length;
        collected.push(...result.articles);
        if (collected.length >= totalResults || result.articles.length === 0 || collected.length >= PAGE_SIZE) break;
        page += 1;
      }
      setAllArticles(collected);
      setVisibleCount(Math.min(20, collected.length || 20));
      setTotal(totalResults || collected.length);
      const initialVisible = Math.min(20, collected.length || 20);
      setHasMore(collected.length > initialVisible || collected.length >= PAGE_SIZE);
      await refetchHistory();
    } catch (err: unknown) {
      setError(parseErrorMessage(err));
      setAllArticles([]);
      setVisibleCount(20);
      setHasMore(false);
      setTotal(0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = (value: string, from?: string, to?: string) => {
    setQuery(value);
    setSelectedFrom(from);
    setSelectedTo(to);
    runSearch(value, from, to);
  };

  const handleLoadMore = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!query) return;
    setVisibleCount((prev) => {
      const next = prev + 20;
      if (next > allArticles.length && allArticles.length >= PAGE_SIZE) {
        runSearch(query, selectedFrom, selectedTo, sortBy);
        setHasMore(true);
        return prev;
      }
      const newVisible = Math.min(next, allArticles.length);
      setHasMore(newVisible < allArticles.length || allArticles.length >= PAGE_SIZE);
      return newVisible;
    });
  };

  const openSave = (article: Article) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedArticle(article);
    setDialogOpen(true);
  };

  const handleSave = async (collectionId: number) => {
    if (!selectedArticle) return;
    await addToCollection.mutateAsync({ collectionId, article: selectedArticle });
    setDialogOpen(false);
  };

  const handleCreateCollection = async (name: string, description?: string) => {
    const created = await createCollection({ name, description });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    return created;
  };

  const handleOpenArticle = (article: Article, index: number) => {
    sessionStorage.setItem(
      "searchStateMeta",
      JSON.stringify({
        selectedIndex: index,
        scrollY: window.scrollY,
      })
    );
    navigate("/app/article", { state: { article, index } });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };
  const savedLookup = useMemo(() => {
    const map = new Map<
      string,
      { collectionId: number; collectionName: string; articleId: number | undefined }[]
    >();
    (collections || []).forEach((c) => {
      (c.articles || []).forEach((a) => {
        if (!a.url) return;
        const current = map.get(a.url) || [];
        current.push({ collectionId: c.id, collectionName: c.name, articleId: a.id });
        map.set(a.url, current);
      });
    });
    return map;
  }, [collections]);

  const handleUnsave = async (article: Article) => {
    const entries = savedLookup.get(article.url);
    if (!entries || entries.length === 0) return;
    const target = entries[0];
    if (target.articleId == null) return;
    undo.schedule("Removing article from collection", () =>
      removeFromCollection.mutateAsync({ collectionId: target.collectionId, articleId: target.articleId as number })
    );
  };

  useEffect(() => {
    const cachedBase = sessionStorage.getItem("searchStateBase");
    const cachedMeta = sessionStorage.getItem("searchStateMeta");
    if (cachedBase) {
      try {
        const data = JSON.parse(cachedBase);
        setQuery(data.query || "");
        setSelectedFrom(data.selectedFrom);
        setSelectedTo(data.selectedTo);
        setSortBy(data.sortBy || "publishedAt");
        setAllArticles(data.allArticles || []);
        setVisibleCount(data.visibleCount || 20);
        setHasMore((data.allArticles || []).length > (data.visibleCount || 20) || (data.allArticles || []).length >= PAGE_SIZE);
        setTotal(data.total || (data.allArticles || []).length);
      } catch {
      }
    }
    if (cachedMeta) {
      try {
        const meta = JSON.parse(cachedMeta);
        setTimeout(() => {
          if (meta.scrollY) {
            window.scrollTo(0, meta.scrollY);
          }
        }, 0);
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    const baseState = {
      query,
      selectedFrom,
      selectedTo,
      sortBy,
      allArticles,
      visibleCount,
      total,
    };
    try {
      sessionStorage.setItem("searchStateBase", JSON.stringify(baseState));
    } catch {
      // no-op persist failure
    }
  }, [query, selectedFrom, selectedTo, sortBy, allArticles, visibleCount, total]);

  return (
    <Stack spacing={3}>
      <Box
        px={0}
        py="18px"
        sx={{ borderRadius: 0, bgcolor: "transparent", boxShadow: "none", borderBottom: "1px solid #9c9ea1" }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Find the latest stories
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Search across recent articles, ranked by recency by default. Save what matters into curated collections.
        </Typography>
        <Box flex={1} mt={2}>
          <SearchBar
            onSearch={handleSearch}
            initialValue={query}
            loading={isFetching}
            suggestions={history}
          />
        </Box>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {isFetching && allArticles.length === 0 && <Loader label="Fetching news..." />}
      {allArticles.length > 0 && (
        <Box display="flex" justifyContent="flex-end">
          <TextField
            select
            label="Order by"
            size="small"
            value={sortBy}
            onChange={(e) => {
              const newSort = e.target.value as "relevancy" | "publishedAt";
              setSortBy(newSort);
              if (query) runSearch(query, selectedFrom, selectedTo, newSort);
            }}
            sx={{ minWidth: 180, mb: 2 }}
          >
            <MenuItem value="relevancy">Relevancy</MenuItem>
            <MenuItem value="publishedAt">Most recent</MenuItem>
          </TextField>
        </Box>
      )}
      {!isFetching && (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          }}
          gap={2}
        >
          {allArticles.slice(0, visibleCount).map((article, idx) => (
            <Box key={article.url}>
              <ArticleCard
                article={article}
                onSave={openSave}
                onRemove={savedLookup.has(article.url) ? () => handleUnsave(article) : undefined}
                savedIn={savedLookup.get(article.url)?.map((e) => e.collectionName)}
                onOpen={() => handleOpenArticle(article, idx)}
              />
            </Box>
          ))}
        </Box>
      )}
      {allArticles.length > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min(visibleCount, allArticles.length)} of {total || allArticles.length}
          </Typography>
          {hasMore && (
            <Button variant="outlined" onClick={handleLoadMore} disabled={isFetching} type="button">
              View more
            </Button>
          )}
        </Stack>
      )}
      <SaveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        collections={collections}
        onCreateCollection={handleCreateCollection}
        onSave={handleSave}
      />
      {loadingCollections && <Loader label="Loading collections..." />}
      <UndoBar pending={undo.pending} progress={undo.progress} onUndo={undo.undo} />
    </Stack>
  );
};
