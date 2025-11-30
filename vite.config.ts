import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // CRUCIAL: Esto permite que los assets carguen correctamente en modo archivo (file://) dentro de Electron
  server: {
    port: 5173,
  }
});