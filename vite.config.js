import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the girly-themed prototype.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
});
