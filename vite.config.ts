import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // A porta fixa importa: o backend só aceita (CORS) a origem http://localhost:5173.
  server: { port: 5173, strictPort: true },
})
