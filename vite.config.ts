import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    root: "client",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
      },
    },
    server: {
      port: 5000,
      host: true,
    },
    build: {
      outDir: "../dist/public",
      sourcemap: true,
      emptyOutDir: true,
    },
  };
});
