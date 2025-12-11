import { Card, CardActions, CardContent, CardMedia, Chip, Stack, Typography, Button, Box, Link } from "@mui/material";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { useState } from "react";
import type { Article } from "../types";

interface Props {
  article: Article;
  onSave?: (article: Article) => void;
  onRemove?: (article: Article) => void;
  onOpen?: (article: Article) => void;
  savedIn?: string[];
}

export const ArticleCard = ({ article, onSave, onRemove, onOpen, savedIn }: Props) => {
  const published = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : null;
  const [hasImageError, setHasImageError] = useState(false);
  const hasImage = !!article.imageUrl && !hasImageError;
  const triggerOpen = () => {
    if (onOpen) onOpen(article);
  };

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid #e5e7eb", borderRadius: "15px", height: "100%", display: "flex", flexDirection: "column" }}
    >
      {hasImage ? (
        <CardMedia
          component="img"
          image={article.imageUrl || undefined}
          alt={article.title}
          sx={{ objectFit: "cover", width: "100%", height: 173, cursor: onOpen ? "pointer" : "default" }}
          onError={() => setHasImageError(true)}
          onClick={triggerOpen}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 173,
            bgcolor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#6b7280",
            cursor: onOpen ? "pointer" : "default",
          }}
          onClick={triggerOpen}
        >
          <BrokenImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Image not available
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {article.source && <Chip size="small" label={article.source} color="primary" sx={{ backgroundColor: "#e6f7ff" }} />}
            {published && (
              <Chip size="small" icon={<CalendarMonthIcon fontSize="small" />} label={published} variant="outlined" />
            )}
          </Stack>
          <Typography
            variant="h6"
            fontWeight={700}
            color="text.primary"
            onClick={triggerOpen}
            sx={{ cursor: onOpen ? "pointer" : "default" }}
          >
            {article.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            onClick={triggerOpen}
            sx={{ cursor: onOpen ? "pointer" : "default" }}
          >
            {article.description || "No description available."}
          </Typography>
          {article.source && article.url && (
            <Typography variant="caption" color="text.secondary">
              Source:{" "}
              <Link href={article.url} target="_blank" rel="noreferrer">
                {article.source}
              </Link>
            </Typography>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1}>
          {onSave && !savedIn?.length && (
            <Button
              startIcon={<BookmarkAddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onSave(article);
              }}
              variant="contained"
              size="small"
            >
              Save
            </Button>
          )}
          {onRemove && savedIn?.length ? (
            <Button
              startIcon={<BookmarkAddIcon sx={{ transform: "scale(0.9)" }} />}
              endIcon={<CloseIcon fontSize="small" />}
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(article);
              }}
              variant="contained"
              size="small"
              sx={{ fontWeight: 300, justifyContent: "center", gap: 0.5, px: 1.5 }}
            >
              {savedIn.length === 1 ? `Saved: ${savedIn[0]}` : `Saved: ${savedIn[0]} +${savedIn.length - 1}`}
            </Button>
          ) : null}
        </Stack>
      </CardActions>
    </Card>
  );
};
