import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

// 自定义插件：移动HTML到根目录并修复路径
const moveHtmlPlugin = () => {
  return {
    name: 'move-html',
    writeBundle() {
      try {
        // 从 public/index.html 移动到根目录的 index.html
        const source = resolve(__dirname, '../dist/popup/public/index.html')
        const target = resolve(__dirname, '../dist/popup/index.html')
        
        // 读取文件内容
        let htmlContent = readFileSync(source, 'utf-8')
        
        // 修复资源路径：../js/ -> js/, ../css/ -> css/
        htmlContent = htmlContent.replace(/\.\.\/js\//g, 'js/')
        htmlContent = htmlContent.replace(/\.\.\/css\//g, 'css/')
        
        // 写入到目标位置
        writeFileSync(target, htmlContent)
        console.log('✅ HTML文件已移动到正确位置并修复了路径')
      } catch (error) {
        console.warn('⚠️ 移动HTML文件失败:', error.message)
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [vue(), moveHtmlPlugin()],
    base: './', // 确保资源使用相对路径
    build: {
      outDir: '../dist/popup',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'public/index.html'),
        output: {
          // Chrome插件不支持hash文件名，统一不使用hash
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              return 'css/[name].css'
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
          additionalData: `@use "sass:color"; @import "@styles/variables.scss"; @import "@styles/mixins.scss";`,
          // 禁用弃用警告
          quietDeps: true,
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions']
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