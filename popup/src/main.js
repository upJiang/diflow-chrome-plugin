import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 导入全局样式
import './styles/index.scss'

// Chrome插件环境检测
const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.runtime

console.log('Diflow Popup initializing...', { isExtensionEnvironment })

const app = createApp(App)

// 配置状态管理
const pinia = createPinia()
app.use(pinia)

// 配置路由
app.use(router)

// 全局属性
app.config.globalProperties.$isExtension = isExtensionEnvironment
app.config.globalProperties.$version = __VERSION__ || '1.0.0'

// 全局错误处理
app.config.errorHandler = (error, vm, info) => {
  console.error('Vue Error:', error, info)
}

// 挂载应用
app.mount('#app')

// Chrome插件特殊处理
if (isExtensionEnvironment) {
  // 设置插件窗口大小
  document.body.style.width = '420px'
  document.body.style.minHeight = '600px'
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Popup received message:', message)
    
    // 处理实时数据更新
    const { type, data } = message
    
    if (type === 'CONSOLE_DATA_UPDATED' || type === 'NETWORK_DATA_UPDATED') {
      // 触发数据更新事件
      window.dispatchEvent(new CustomEvent('diflow-data-updated', {
        detail: { type, data }
      }))
    }
    
    if (type === 'DATA_CLEARED') {
      window.dispatchEvent(new CustomEvent('diflow-data-cleared', {
        detail: { dataType: data }
      }))
    }
  })
  
  console.log('Chrome extension environment configured')
} else {
  console.log('Running in development mode')
} 