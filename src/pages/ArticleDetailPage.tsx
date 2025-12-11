import { Alert, Box, Breadcrumbs, Button, Chip, Container, Link, Stack, Typography, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Article } from "../types";
import { ArticleCard } from "../components/ArticleCard";

interface ArticleState {
  article?: Article;
  index?: number;
}

export const ArticleDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as ArticleState;
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [articleIndex, setArticleIndex] = useState<number>(state.index ?? 0);
  const [article, setArticle] = useState<Article | undefined>(state.article);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("searchState");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Array.isArray(data.allArticles)) {
          setArticleList(data.allArticles);
          if (typeof data.selectedIndex === "number") {
            setArticleIndex(data.selectedIndex);
            setArticle(data.allArticles[data.selectedIndex]);
          }
        }
      } catch {
      }
    }
  }, [state.article, state.index]);

  const published = article?.publishedAt ? new Date(article.publishedAt).toLocaleString() : null;

  const hasPrev = articleList.length > 0 && articleIndex > 0;
  const hasNext = articleList.length > 0 && articleIndex < articleList.length - 1;

  const seeAlso = useMemo(() => {
    if (!articleList.length || articleIndex == null) return [];
    const start = Math.max(0, articleIndex - 2);
    const end = Math.min(articleList.length, articleIndex + 4);
    return articleList.slice(start, end).map((item, idx) => ({
      item,
      idx: start + idx,
    }));
  }, [articleList, articleIndex]);

  const goToIndex = (idx: number) => {
    if (idx < 0 || idx >= articleList.length) return;
    setArticleIndex(idx);
    setArticle(articleList[idx]);
    sessionStorage.setItem(
      "searchState",
      JSON.stringify({
        ...JSON.parse(sessionStorage.getItem("searchState") || "{}"),
        selectedIndex: idx,
      })
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    if (startX == null) return;
    const deltaX = e.changedTouches[0].clientX - startX;
    const threshold = 50;
    if (deltaX > threshold && hasPrev) {
      goToIndex(articleIndex - 1);
    } else if (deltaX < -threshold && hasNext) {
      goToIndex(articleIndex + 1);
    }
    touchStartX.current = null;
  };

  if (!article) {
    return (
      <Container maxWidth="xl" disableGutters sx={{ py: 4, px: { xs: 2, md: 3 } }}>
        <Alert severity="warning">Article data not available. Please return to search.</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/app/search")}>
          Back to search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ py: 4, px: { xs: 2, md: 3 }, position: "relative" }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate("/app/search")} sx={{ cursor: "pointer" }}>
          Discover
        </Link>
        <Typography color="text.primary">
          {(article.title || "Article").slice(0, 30)}
          {article.title && article.title.length > 30 ? "…" : ""}
        </Typography>
      </Breadcrumbs>
      <Button
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/app/search");
        }}
      >
        Back to search
      </Button>

      {hasPrev && (
        <IconButton
          onClick={() => goToIndex(articleIndex - 1)}
          sx={{ position: "fixed", top: "50%", left: 16, zIndex: 10, bgcolor: "white", boxShadow: 2 }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      )}
      {hasNext && (
        <IconButton
          onClick={() => goToIndex(articleIndex + 1)}
          sx={{ position: "fixed", top: "50%", right: 16, zIndex: 10, bgcolor: "white", boxShadow: 2 }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}

      <Stack spacing={3} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Typography variant="h3" fontWeight={800}>
          {article.title}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {article.source && <Chip label={article.source} color="primary" />}
          {published && (
            <Chip
              icon={<CalendarMonthIcon fontSize="small" />}
              label={published}
              variant="outlined"
            />
          )}
        </Stack>
        <Box
          sx={{
            width: "100%",
            minHeight: 240,
            maxHeight: 720,
            bgcolor: "#f3f4f6",
            borderRadius: "15px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = "";
              }}
            />
          ) : (
            <Stack alignItems="center" spacing={1} color="#6b7280">
              <BrokenImageIcon sx={{ fontSize: 48 }} />
              <Typography variant="caption">Image not available</Typography>
            </Stack>
          )}
        </Box>
        {article.description && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: "pre-line", mb: 1 }}>
            {article.description}
          </Typography>
        )}
        <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7, whiteSpace: "pre-line", mt: 1 }}>
          {article.content || article.description || "No content available."}
        </Typography>
        {article.url && (
          <Typography variant="body2">
            Original article:{" "}
            <Link href={article.url} target="_blank" rel="noreferrer">
              {article.url}
            </Link>
          </Typography>
        )}

        {/* See also */}
        {seeAlso.length > 1 && (
          <Stack spacing={2} sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={700}>
              See also
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(auto-fit, minmax(200px, 1fr))",
                md: "repeat(3, minmax(220px, 1fr))",
                lg: "repeat(4, minmax(220px, 1fr))",
                xl: "repeat(5, minmax(220px, 1fr))",
              }}
              gap={2}
            >
              {seeAlso
                .filter((entry) => entry.idx !== articleIndex)
                .slice(0, 5)
                .map((entry) => (
                  <Box key={`${entry.idx}-${entry.item.url}`} onClick={() => goToIndex(entry.idx)} sx={{ cursor: "pointer" }}>
                    <ArticleCard article={entry.item} />
                  </Box>
                ))}
            </Box>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
