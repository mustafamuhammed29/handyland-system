import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: 'handyland-digital-signage-pwa',
        name: 'HANDYLAND Digital Signage System',
        short_name: 'HANDYLAND',
        description: 'Digital Signage System for TV Screens & Shop Displays',
        start_url: './',
        scope: './',
        lang: 'de',
        dir: 'ltr',
        categories: ['business', 'utilities', 'productivity', 'lifestyle'],
        theme_color: '#eab308',
        background_color: '#050505',
        display: 'fullscreen',
        display_override: ['window-controls-overlay', 'tabbed', 'fullscreen', 'minimal-ui', 'standalone'],
        orientation: 'any',
        prefer_related_applications: false,
        related_applications: [
          {
            platform: 'webapp',
            url: 'https://mustafamuhammed29.github.io/handyland-system/manifest.webmanifest',
            id: 'handyland-digital-signage-pwa'
          }
        ],
        iarc_rating_id: 'e84b3a5d-4523-40fa-9672-351e3604b77d',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'HANDYLAND TV Screen Display'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'HANDYLAND Mobile Control'
          }
        ],
        shortcuts: [
          {
            name: 'Screen 1 - Smartphones',
            short_name: 'Screen 1',
            description: 'Top Offers & Smartphones Display',
            url: './#screen1',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Screen 2 - Repairs',
            short_name: 'Screen 2',
            description: 'Repair Center & Pricing Display',
            url: './#screen2',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Screen 3 - Special Offers',
            short_name: 'Screen 3',
            description: 'Special Offers & News Display',
            url: './#screen3',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          }
        ],
        file_handlers: [
          {
            action: './',
            accept: {
              'image/png': ['.png'],
              'image/jpeg': ['.jpg', '.jpeg']
            }
          }
        ],
        launch_handler: {
          client_mode: ['navigate-existing', 'auto']
        },
        protocol_handlers: [
          {
            protocol: 'web+handyland',
            url: './?url=%s'
          }
        ],
        share_target: {
          action: './',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        widgets: [
          {
            name: 'HANDYLAND Status',
            short_name: 'HANDYLAND',
            description: 'HANDYLAND Digital Signage Status Widget',
            tag: 'handyland_widget',
            template: 'widget_template',
            ms_ac_template: 'widget_template.json',
            data: 'widget_data.json',
            type: 'application/json',
            screenshots: [
              {
                src: 'screenshot-wide.png',
                sizes: '1920x1080',
                label: 'Widget Preview'
              }
            ],
            icons: [
              {
                src: 'icon-192.png',
                sizes: '192x192'
              }
            ],
            author: 'HANDYLAND'
          }
        ],
        edge_side_panel: {
          preferred_width: 400
        },
        note_taking: {
          new_note_url: './#screen1'
        }
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: './',
})
