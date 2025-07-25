import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Reemplaza con tu nombre de repo:
export default defineConfig({
  plugins: [vue()],
  base: '/observatorio/', // el nombre exacto del repositorio en GitHub
})
