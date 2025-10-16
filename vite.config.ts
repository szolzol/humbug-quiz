import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from "path";

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },
  build: {
    // Better browser compatibility - target older browsers
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    // CSS target for better color space fallbacks
    cssTarget: ["chrome87", "safari14"],
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Ensure service worker is not hashed
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "sw.js") {
            return "sw.js";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  // Optimize dependencies for better compatibility
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion"],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
