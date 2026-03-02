import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"], // keep if you have lucide-react issues
  },
  base: "/", // root path, fine for vercel root domain
  build: {
    outDir: "dist",       // default build folder
    emptyOutDir: true,    // clean old files
    sourcemap: true,      // optional, helpful for debugging
  },
  server: {
    port: 5471,
    open: true,
  },
});
