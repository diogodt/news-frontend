import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import type { PendingUndo } from "../hooks/useUndoableAction";

interface Props {
  pending: PendingUndo | null;
  progress: number;
  onUndo: () => void;
}

export const UndoBar = ({ pending, progress, onUndo }: Props) => {
  if (!pending) return null;
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      width="100%"
      bgcolor="white"
      boxShadow="0 -4px 12px rgba(0,0,0,0.08)"
      borderTop="1px solid #e5e7eb"
      zIndex={1300}
      px={3}
      py={2}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Stack sx={{ flex: 1 }} spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {pending.label}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 6 }} />
        </Stack>
        <Button variant="contained" color="primary" onClick={onUndo}>
          Undo removal
        </Button>
      </Stack>
    </Box>
  );
};
