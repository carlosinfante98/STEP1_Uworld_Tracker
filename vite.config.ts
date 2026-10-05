import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://<user>.github.io/STEP1_Uworld_Tracker/ on GitHub Pages.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/STEP1_Uworld_Tracker/',
  plugins: [react(), tailwindcss()],
})
