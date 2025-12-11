import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e8db5", // text accent
      light: "#88d8f9", // backgrounds
      contrastText: "#01334b",
    },
    secondary: {
      main: "#68dd97",
    },
    text: {
      primary: "#1e1e1e",
      secondary: "#7A7A7A",
    },
    background: {
      default: "#ffffff",
      paper: "#f9fbfd",
    },
    success: {
      main: "#68dd97",
    },
    info: {
      main: "#014260",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Roboto Slab", serif', fontWeight: 600 },
    h2: { fontFamily: '"Roboto Slab", serif', fontWeight: 600 },
    h3: { fontFamily: '"Roboto Slab", serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
          "&:focusVisible": { boxShadow: "none" },
        },
        containedPrimary: {
          backgroundColor: "#88d8f9",
          color: "#0f4056",
          "&:hover": { backgroundColor: "#7acff3" },
          "&:active": { backgroundColor: "#6fc5e9" },
        },
        containedSecondary: {
          backgroundColor: "#68dd97",
          color: "#0f3a26",
          "&:hover": { backgroundColor: "#5fcf8c" },
          "&:active": { backgroundColor: "#54c481" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: 6,
          },
        },
        input: {
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#88d8f9",
          color: "#0f4056",
        },
        colorSecondary: {
          backgroundColor: "#68dd97",
          color: "#0f3a26",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
          "&:focusVisible": { boxShadow: "none" },
        },
      },
    },
  },
});

export default theme;
