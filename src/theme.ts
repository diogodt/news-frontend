import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6EC1E4",
      contrastText: "#01334b",
    },
    secondary: {
      main: "#61CE70",
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
      main: "#00B74A",
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
  },
});

export default theme;
