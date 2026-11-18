import { defineConfig } from "vite";

export default defineConfig({
  // Pre-bundle lazy export libraries so the first invoice download does not
  // trigger a development-server reload and interrupt the download.
  optimizeDeps: { include: ["jspdf", "jspdf-autotable", "jsbarcode", "xlsx"] },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
});
