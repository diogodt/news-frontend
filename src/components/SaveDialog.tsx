import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import type { Collection } from "../types";

interface Props {
  open: boolean;
  collections: Collection[];
  onClose: () => void;
  onCreateCollection: (name: string, description?: string) => Promise<Collection>;
  onSave: (collectionId: number) => Promise<void>;
}

export const SaveDialog = ({ open, onClose, collections, onCreateCollection, onSave }: Props) => {
  const [selectedId, setSelectedId] = useState<number | string>("");
  const [newName, setNewName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAndSave = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    const created = await onCreateCollection(newName.trim(), description.trim() || undefined);
    setSelectedId(created.id);
    await onSave(created.id);
    reset();
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    await onSave(Number(selectedId));
    reset();
  };

  const reset = () => {
    setSubmitting(false);
    setSelectedId("");
    setNewName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={reset} fullWidth maxWidth="sm">
      <DialogTitle>Save to collection</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Choose an existing collection"
            fullWidth
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            helperText="Pick one to save this article"
          >
            <option value="">Select...</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </TextField>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              or create a new one
            </Typography>
          </Stack>
          <TextField
            label="New collection name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={reset}>Cancel</Button>
        <Button variant="outlined" onClick={handleCreateAndSave} disabled={submitting}>
          Create & Save
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting || !selectedId}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
