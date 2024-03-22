import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Unocss(),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        { 'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'] }
      ],
      vueTemplate: true,
      dirs: ['src/stores/modules', 'src/components/Common'],
      dts: 'types/auto-imports.d.ts'
    }),
    Components({ dts: 'types/components.d.ts', resolvers: [NaiveUiResolver()] })
  ],
  esbuild: { pure: ['console.log', 'console.info', 'console.error'] },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
