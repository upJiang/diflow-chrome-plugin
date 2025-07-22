import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [vue()],
    base: './', // 确保资源使用相对路径
    build: {
      outDir: '../dist/popup',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'public/index.html')
        },
        output: {
          // 确保文件名不包含hash，方便Chrome插件引用
          entryFileNames: isProduction ? 'js/[name].js' : 'js/[name].[hash].js',
          chunkFileNames: isProduction ? 'js/[name].js' : 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              return isProduction ? 'css/[name].css' : 'css/[name].[hash].css'
            }
            return 'assets/[name].[ext]'
          }
        }
      },
      // Chrome插件CSP要求
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@views': resolve(__dirname, 'src/views'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@services': resolve(__dirname, 'src/services'),
        '@composables': resolve(__dirname, 'src/composables'),
        '@styles': resolve(__dirname, 'src/styles')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss"; @import "@styles/mixins.scss";`
        }
      }
    },
    define: {
      // 在构建时注入环境变量
      __IS_CHROME_EXTENSION__: true,
      __VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    server: {
      port: 3000,
      hmr: {
        port: 3001
      }
    }
  }
}) 