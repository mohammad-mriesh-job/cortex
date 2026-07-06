import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project site under /cortex/. Keep dev at root.
  base: command === 'build' ? '/cortex/' : '/',
  plugins: [react()],
  build: {
    // Tutorial content (all markdown) is bundled for instant offline search,
    // which makes the content chunks legitimately large. Mermaid, KaTeX and the
    // page components are code-split via dynamic import / React.lazy.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Give each track its own content+questions chunk. Without this the
        // whole corpus lands in one enormous chunk that overruns the bundler's
        // WebAssembly parser memory during minification/import-analysis.
        manualChunks(id) {
          const match = id.match(/[/\\]modules[/\\]([^/\\]+)[/\\](?:content|questions)[/\\]/);
          if (match) return `track-${match[1]}`;
          return undefined;
        },
      },
    },
  },
}))
