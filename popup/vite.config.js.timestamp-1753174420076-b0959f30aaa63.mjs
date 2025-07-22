// popup/vite.config.js
import { defineConfig } from "file:///Users/mac/Desktop/studyProject/diflow-chrome-plugin/.yarn/__virtual__/vite-virtual-207a979caf/0/cache/vite-npm-4.5.14-e7160a8deb-ed61e2bc28.zip/node_modules/vite/dist/node/index.js";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/mac/Desktop/studyProject/diflow-chrome-plugin/popup";
var vite_config_default = defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  return {
    plugins: [vue()],
    base: "./",
    // 确保资源使用相对路径
    build: {
      outDir: "../dist/popup",
      assetsDir: "assets",
      rollupOptions: {
        input: {
          popup: resolve(__vite_injected_original_dirname, "public/index.html")
        },
        output: {
          // 确保文件名不包含hash，方便Chrome插件引用
          entryFileNames: isProduction ? "js/[name].js" : "js/[name].[hash].js",
          chunkFileNames: isProduction ? "js/[name].js" : "js/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith(".css")) {
              return isProduction ? "css/[name].css" : "css/[name].[hash].css";
            }
            return "assets/[name].[ext]";
          }
        }
      },
      // Chrome插件CSP要求
      minify: isProduction ? "terser" : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      }
    },
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src"),
        "@components": resolve(__vite_injected_original_dirname, "src/components"),
        "@views": resolve(__vite_injected_original_dirname, "src/views"),
        "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
        "@services": resolve(__vite_injected_original_dirname, "src/services"),
        "@composables": resolve(__vite_injected_original_dirname, "src/composables"),
        "@styles": resolve(__vite_injected_original_dirname, "src/styles")
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
      port: 3e3,
      hmr: {
        port: 3001
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicG9wdXAvdml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFjL0Rlc2t0b3Avc3R1ZHlQcm9qZWN0L2RpZmxvdy1jaHJvbWUtcGx1Z2luL3BvcHVwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFjL0Rlc2t0b3Avc3R1ZHlQcm9qZWN0L2RpZmxvdy1jaHJvbWUtcGx1Z2luL3BvcHVwL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYWMvRGVza3RvcC9zdHVkeVByb2plY3QvZGlmbG93LWNocm9tZS1wbHVnaW4vcG9wdXAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSAncHJvZHVjdGlvbidcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3Z1ZSgpXSxcbiAgICBiYXNlOiAnLi8nLCAvLyBcdTc4NkVcdTRGRERcdThENDRcdTZFOTBcdTRGN0ZcdTc1MjhcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnLi4vZGlzdC9wb3B1cCcsXG4gICAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBpbnB1dDoge1xuICAgICAgICAgIHBvcHVwOiByZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9pbmRleC5odG1sJylcbiAgICAgICAgfSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU2NTg3XHU0RUY2XHU1NDBEXHU0RTBEXHU1MzA1XHU1NDJCaGFzaFx1RkYwQ1x1NjVCOVx1NEZCRkNocm9tZVx1NjNEMlx1NEVGNlx1NUYxNVx1NzUyOFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiBpc1Byb2R1Y3Rpb24gPyAnanMvW25hbWVdLmpzJyA6ICdqcy9bbmFtZV0uW2hhc2hdLmpzJyxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogaXNQcm9kdWN0aW9uID8gJ2pzL1tuYW1lXS5qcycgOiAnanMvW25hbWVdLltoYXNoXS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZS5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpc1Byb2R1Y3Rpb24gPyAnY3NzL1tuYW1lXS5jc3MnIDogJ2Nzcy9bbmFtZV0uW2hhc2hdLmNzcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS5bZXh0XSdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBDaHJvbWVcdTYzRDJcdTRFRjZDU1BcdTg5ODFcdTZDNDJcbiAgICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uID8gJ3RlcnNlcicgOiBmYWxzZSxcbiAgICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICBkcm9wX2NvbnNvbGU6IGlzUHJvZHVjdGlvbixcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiBpc1Byb2R1Y3Rpb25cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgICAgICAnQGNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJyksXG4gICAgICAgICdAdmlld3MnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy92aWV3cycpLFxuICAgICAgICAnQHV0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdXRpbHMnKSxcbiAgICAgICAgJ0BzZXJ2aWNlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NlcnZpY2VzJyksXG4gICAgICAgICdAY29tcG9zYWJsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb3NhYmxlcycpLFxuICAgICAgICAnQHN0eWxlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3N0eWxlcycpXG4gICAgICB9XG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQGltcG9ydCBcIkBzdHlsZXMvdmFyaWFibGVzLnNjc3NcIjsgQGltcG9ydCBcIkBzdHlsZXMvbWl4aW5zLnNjc3NcIjtgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgLy8gXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2Q0U4XHU1MTY1XHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG4gICAgICBfX0lTX0NIUk9NRV9FWFRFTlNJT05fXzogdHJ1ZSxcbiAgICAgIF9fVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgaG1yOiB7XG4gICAgICAgIHBvcnQ6IDMwMDFcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pICJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1csU0FBUyxvQkFBb0I7QUFDN1gsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZTtBQUZ4QixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLGVBQWUsU0FBUztBQUU5QixTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQUEsSUFDZixNQUFNO0FBQUE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLGVBQWU7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMLE9BQU8sUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxRQUMvQztBQUFBLFFBQ0EsUUFBUTtBQUFBO0FBQUEsVUFFTixnQkFBZ0IsZUFBZSxpQkFBaUI7QUFBQSxVQUNoRCxnQkFBZ0IsZUFBZSxpQkFBaUI7QUFBQSxVQUNoRCxnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGdCQUFJLFVBQVUsS0FBSyxTQUFTLE1BQU0sR0FBRztBQUNuQyxxQkFBTyxlQUFlLG1CQUFtQjtBQUFBLFlBQzNDO0FBQ0EsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsUUFBUSxlQUFlLFdBQVc7QUFBQSxNQUNsQyxlQUFlO0FBQUEsUUFDYixVQUFVO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxlQUFlO0FBQUEsUUFDakI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxRQUM3QixlQUFlLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsUUFDbEQsVUFBVSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxRQUN4QyxVQUFVLFFBQVEsa0NBQVcsV0FBVztBQUFBLFFBQ3hDLGFBQWEsUUFBUSxrQ0FBVyxjQUFjO0FBQUEsUUFDOUMsZ0JBQWdCLFFBQVEsa0NBQVcsaUJBQWlCO0FBQUEsUUFDcEQsV0FBVyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUM1QztBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLE1BRU4seUJBQXlCO0FBQUEsTUFDekIsYUFBYSxLQUFLLFVBQVUsUUFBUSxJQUFJLG1CQUFtQjtBQUFBLElBQzdEO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsUUFDSCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
