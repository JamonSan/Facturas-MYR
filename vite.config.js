import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './', // Fundamental para que funcione en GitHub Pages (subcarpetas)
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt', // Muestra un aviso cuando hay actualización
      includeAssets: ['favicon.ico', 'image.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'MyR Facturas',
        short_name: 'MyR',
        description: 'Gestor de facturas local para Robert Huart S.L.',
        theme_color: '#ffffff',
        background_color: '#fffaf9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
