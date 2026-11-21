import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
      coverage: {
        provider: "v8",
        include: ["src/features/**/domain/**"],
        thresholds: {
          lines: 80,
          functions: 80,
          statements: 80,
          branches: 80,
        },
      },
    },
  }),
);