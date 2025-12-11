import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { logError } from "../utils/logger";

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError("Unhandled UI error", { error: error.message, stack: error.stack, info });
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <Box className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Typography variant="h5" fontWeight={700}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            An unexpected error occurred. Please reload and try again.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
