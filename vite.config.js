import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Evita que Vite cambie silenciosamente a otro puerto y parezca que la base local está vacía.
  server: { port: 5173, strictPort: true },
  test: { environment: 'jsdom', restoreMocks: true, clearMocks: true },
});
