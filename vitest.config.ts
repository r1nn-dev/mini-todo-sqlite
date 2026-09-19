import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // Test files share the real prisma/dev.db (see research.md); run them
    // sequentially so one file's beforeEach cleanup can't race another
    // file's still-running assertions against the same SQLite file.
    fileParallelism: false,
  },
});
