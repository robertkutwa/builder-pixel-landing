import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(process.cwd(), "server/node-build.js"),
      name: "Server",
      fileName: "node-build",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["express", "cors", "zod"],
    },
    outDir: "dist/server",
    ssr: true,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(process.cwd(), "./shared"),
    },
  },
});
