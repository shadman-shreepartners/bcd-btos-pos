import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    /** Prevents stale browser requests after dep graph changes; clear `node_modules/.vite` if 504 persists. */
    optimizeDeps: {
        include: ["zustand", "zustand/middleware"],
    },
    resolve: {
        alias: {
            "@": path.resolve(rootDir, "src"),
        },
    },
})
