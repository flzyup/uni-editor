import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readmeTodosPlugin } from './vite-plugin-readme-todos.js'

export default defineConfig({
  plugins: [vue(), readmeTodosPlugin()],
})

