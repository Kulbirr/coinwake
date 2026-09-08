// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    externals: {
      inline: ["tslib"],
    },
    // Copy tslib to _libs after build so _libs can resolve it
    hooks: {
      "compiled": async ({ nitro }) => {
        const fs = await import("fs");
        const path = await import("path");
        const outputDir = nitro.options.output.dir;
        const tslibPath = path.join(outputDir, "functions", "__server.func", "node_modules", "tslib");
        const libsPath = path.join(outputDir, "functions", "__server.func", "_libs", "tslib");
        if (fs.existsSync(tslibPath) && !fs.existsSync(libsPath)) {
          fs.cpSync(tslibPath, libsPath, { recursive: true });
          console.log("Copied tslib to _libs");
        }
      },
    },
  },
});
