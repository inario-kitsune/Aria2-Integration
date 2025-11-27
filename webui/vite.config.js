import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  base: "./", // Use relative paths for browser extension compatibility
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Single file output for easier integration
        entryFileNames: "webui.js",
        assetFileNames: "webui.[ext]",
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
