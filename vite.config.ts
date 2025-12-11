import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.VITE_PUBLIC_BASE || "/";
const apiBase = process.env.VITE_API_URL || "http://localhost:8000/api";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  define: {
    __APP_API_URL__: JSON.stringify(apiBase),
  },
});
