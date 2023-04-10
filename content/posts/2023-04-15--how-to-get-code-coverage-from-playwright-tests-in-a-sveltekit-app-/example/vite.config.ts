import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    sveltekit(),
    istanbul({
      include: "src/*",
      exclude: ["node_modules", "test/"],
      extension: [".ts", ".svelte"],
      requireEnv: false,
      forceBuildInstrument: true,
    }),
  ],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
