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
            weights: [400],
            styles: ['normal', 'italic'],
          },
          {
            name: 'Iosevka Charon Mono',
            weights: [500],
            styles: ['normal'],
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
      // call this hook before vite generates assets
      generateBundle (_, bundle) {
        for (const fileName in bundle) {
          // check for fonts extentions we don't want to keep
          if (/\.(ttf|eot|woff|otf)$/.test(fileName)) {
            delete bundle[fileName]
            console.log(`🗑️  Asset entfernt: ${fileName}`)
          }
        }
      },
    },
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
