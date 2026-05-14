import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import mockApiPlugin from "./mock/mockApiPlugin.js";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === "serve" ? mockApiPlugin() : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    allowedHosts: "all",
  },
  preview: {
    host: true,
    allowedHosts: "all",
  },
}));
