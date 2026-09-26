import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Chỉ chạy file test nguồn, không chạy lại file JavaScript cũ trong dist.
    include: ["test/**/*.test.ts"],
    environment: "node",
    clearMocks: true,
    // MongoDB tạm có thể cần thêm thời gian để khởi động ở lần chạy đầu tiên.
    hookTimeout: 120000,
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Báo cáo coverage chỉ tính code ứng dụng, không tính helper của test.
      exclude: ["test/**", "dist/**", "node_modules/**"]
    }
  }
});
