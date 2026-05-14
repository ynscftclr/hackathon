import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import mockApiPlugin from "./mock/mockApiPlugin.js";

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    host: true,
    allowedHosts: "all",
  },
  preview: {
    host: true,
    allowedHosts: "all",
  },
});
