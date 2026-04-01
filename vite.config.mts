import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
      custom: {
        families: [
          {
            name: 'Material Design Icons',
            local: 'Material Design Icons',
            src: './node_modules/@mdi/font/fonts/materialdesignicons-webfont.woff2',
          },
        ],
        display: 'block',
        preload: false,
      },
    }),
    {
      name: 'exclude-unused-fonts',
      // Dieser Hook wird aufgerufen, bevor Vite ein Asset generiert
      generateBundle(_, bundle) {
        for (const fileName in bundle) {
          // Prüfe auf die Dateiendungen, die du NICHT willst
          if (fileName.match(/\.(ttf|eot|woff|otf)$/)) {
            delete bundle[fileName];
            console.log(`🗑️  Asset entfernt: ${fileName}`);
          }
        }
      }
    }
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
