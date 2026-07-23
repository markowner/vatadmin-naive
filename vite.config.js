import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const proxyPrefix = env.VITE_APP_PROXY_PREFIX
    return {
      plugins: [
          vue(),
          AutoImport({
            imports: [
                'vue',
                {
                  'naive-ui': [
                    'useDialog',
                    'useMessage',
                    'useNotification',
                    'useLoadingBar'
                  ]
                }
            ]
          }),
          Components({
            resolvers: [NaiveUiResolver()]
          })
      ],
      resolve: {
        alias: {
          '@': '/src'
        },
      },
      server: {
        port: env.VITE_APP_PORT,
        proxy: {
          [proxyPrefix]: {
              target: env.VITE_API_URL,
              ws: true,
              changeOrigin: true,   // 允许跨域
              rewrite: (path) => path.replace(new RegExp(`^${proxyPrefix}`), '') // 重写路径把路径变成空字符
          }
        }
      }
    }
})
