import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { ArticleCard } from "../components/ArticleCard";
import { CollectionFormDialog } from "../components/CollectionFormDialog";
import {
  createCollection,
  deleteCollection,
  fetchCollection,
  fetchCollections,
  removeArticleFromCollection,
  updateCollection,
} from "../api/collections";
import type { Collection } from "../types";
import { Loader } from "../components/Loader";
import { useUndoableAction } from "../hooks/useUndoableAction";
import { UndoBar } from "../components/UndoBar";

export const CollectionsPage = () => {
  const queryClient = useQueryClient();
  const { data: collections = [], isLoading, error } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });
  const undo = useUndoableAction();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  const { data: collectionDetail, isFetching: loadingDetail } = useQuery({
    queryKey: ["collection", selectedId],
    queryFn: () => fetchCollection(selectedId as number),
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (!selectedId && collections.length > 0) {
      setSelectedId(collections[0].id);
    }
  }, [collections, selectedId]);

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name?: string; description?: string } }) =>
      updateCollection(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", selectedId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setSelectedId(null);
    },
  });

  const removeArticleMutation = useMutation({
    mutationFn: ({ articleId }: { articleId: number }) => removeArticleFromCollection(selectedId as number, articleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection", selectedId] }),
  });

  const selectedCollection = collections.find((c) => c.id === selectedId) || null;

  const openCreate = () => {
    setFormMode("create");
    setEditingCollection(null);
    setFormOpen(true);
  };

  const openEdit = (col: Collection) => {
    setFormMode("edit");
    setEditingCollection(col);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: { name: string; description?: string }) => {
    if (formMode === "create") {
      await createMutation.mutateAsync(payload);
    } else if (editingCollection) {
      await updateMutation.mutateAsync({ id: editingCollection.id, payload });
    }
  };

  const handleDeletePrompt = (id: number) => {
    const collectionName = collections.find((c) => c.id === id)?.name || "collection";
    setConfirmDeleteId(id);
    setConfirmDeleteName(collectionName);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    undo.schedule(`Deleting ${confirmDeleteName}`, () => deleteMutation.mutateAsync(confirmDeleteId));
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight={700}>
            Your collections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Curate stories into themed collections and keep them synced.
          </Typography>
        </div>
        <Button variant="contained" onClick={openCreate}>
          New collection
        </Button>
      </Stack>
      {error && <Alert severity="error">Could not load collections.</Alert>}
      {isLoading && <Loader label="Loading collections..." />}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }} sx={{ flexBasis: { md: "20%" }, maxWidth: { md: "20%" } }}>
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
            <CardContent>
              <List>
                {collections.map((collection) => (
                  <ListItem
                    key={collection.id}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => openEdit(collection)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeletePrompt(collection.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    }
                    disablePadding
                  >
                    <ListItemButton selected={collection.id === selectedId} onClick={() => setSelectedId(collection.id)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#88d8f9" }}>
                          <LibraryBooksIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={collection.name}
                        secondary={`${collection.articleCount ?? collection.articles?.length ?? 0} saved`}
                        primaryTypographyProps={{ fontWeight: 700 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {collections.length === 0 && <Typography variant="body2">No collections yet.</Typography>}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", minHeight: 320 }}>
            <CardContent>
              {loadingDetail && <Loader label="Loading articles..." />}
              {!loadingDetail && selectedCollection && collectionDetail && (
                <Stack spacing={2}>
                  <Typography variant="h5" fontWeight={700}>
                    {collectionDetail.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {collectionDetail.description || "No description"}
                  </Typography>
                  <Grid container spacing={2}>
                    {(collectionDetail.articles || []).map((article) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                        <ArticleCard
                          article={article}
                          onRemove={(art) => {
                            const articleId = art.id;
                            if (!articleId) return;
                            undo.schedule("Removing article from collection", () =>
                              removeArticleMutation.mutateAsync({ articleId })
                            );
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {(collectionDetail.articles?.length || 0) === 0 && (
                    <Box className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
                      <Typography variant="body2" color="text.secondary">
                        No articles yet. Save stories from search to populate this collection.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
              {!selectedCollection && !loadingDetail && (
                <Typography variant="body2" color="text.secondary">
                  Choose a collection to view its articles.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <CollectionFormDialog
        open={formOpen}
        title={formMode === "create" ? "New collection" : "Rename collection"}
        initialName={editingCollection?.name}
        initialDescription={editingCollection?.description || ""}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete collection</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{confirmDeleteName}</strong>? You can still undo within 5 seconds.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <UndoBar pending={undo.pending} progress={undo.progress} onUndo={undo.undo} />
    </Stack>
  );
};
