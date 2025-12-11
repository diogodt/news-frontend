import { CircularProgress, Stack, Typography } from "@mui/material";

export const Loader = ({ label }: { label?: string }) => (
  <Stack alignItems="center" spacing={2} justifyContent="center" className="py-12">
    <CircularProgress color="primary" />
    {label && (
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    )}
  </Stack>
);

export const FullScreenLoader = ({ label }: { label?: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <Loader label={label} />
  </div>
);
