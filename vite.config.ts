import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/places': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/places/, '/maps/api/place'),
        configure: (proxy, _options) => {
          // Add headers that Google API might expect
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Set proper referer and origin headers to match allowed domains in Google Cloud Console
            // Use a more generic referer that might be allowed in your Google Cloud Console settings
            proxyReq.setHeader('Referer', '*');
            proxyReq.setHeader('Origin', 'http://localhost:8080');
            // Remove any existing X-Requested-With header which might trigger CORS preflight
            proxyReq.removeHeader('X-Requested-With');
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },

    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
