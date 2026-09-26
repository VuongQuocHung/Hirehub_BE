import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Chỉ chạy file test nguồn, không chạy lại file JavaScript cũ trong dist.
    include: ["test/**/*.test.ts"],
    environment: "node",
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  }
});
