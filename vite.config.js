import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { seoAutoPlugin } from './scripts/seoAutoPlugin.mjs';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    plugins: [react(), tailwindcss(), seoAutoPlugin(env)],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
              { name: 'vendor-motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 20 },
              { name: 'vendor-icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
  };
});
