import { defineConfig } from 'vite';
import { resolve } from 'path';

// Pages served with a clean URL (no .html) in dev & production.
// Production rewrites are defined in vercel.json.
const cleanUrls = ['fitur', 'benefits', 'harga', 'cara', 'testimoni', 'faq', 'developer'];

export default defineConfig({
  // Relative base so the build works from any static hosting path
  // (e.g. https://obitoglory.tech/ or a sub-folder).
  base: './',
  plugins: [
    {
      // Serve /<page> (clean URL) in dev, matching production (Vercel rewrite).
      name: 'dev-clean-urls',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const match = req.url.replace(/\/+$/, '');
          if (cleanUrls.includes(match)) {
            req.url = `/${match}.html`;
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    target: 'es2018',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        ...Object.fromEntries(cleanUrls.map((p) => [p, resolve(process.cwd(), `${p}.html`)]))
      }
    }
  }
});
