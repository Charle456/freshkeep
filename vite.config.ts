import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      sourcemap: false,
    },
    plugins: [
      react({
        babel: {
          plugins: isDevelopment ? ['react-dev-locator'] : [],
        },
      }),
      tsconfigPaths()
    ],
  }
})
