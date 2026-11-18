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
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 80,
        },
      },
    },
  }),
);