import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useConsoleStore } from './store/modules/console.js'
import { useNetworkStore } from './store/modules/network.js'

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
  document.body.style.width = '520px'
  document.body.style.minHeight = '600px'
  document.body.style.maxHeight = '750px'
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Popup received message:', message)
    
    // 处理实时数据更新
    const { type, data } = message
    
    if (type === 'CONSOLE_DATA_UPDATED') {
      // 更新console数据
      const consoleStore = useConsoleStore()
      consoleStore.addConsoleLog(data.data)
      
      // 触发数据更新事件
      window.dispatchEvent(new CustomEvent('diflow-data-updated', {
        detail: { type, data }
      }))
    } else if (type === 'NETWORK_DATA_UPDATED') {
      // 更新network数据
      const networkStore = useNetworkStore()
      networkStore.addNetworkRequest(data.data)
      
      // 触发数据更新事件
      window.dispatchEvent(new CustomEvent('diflow-data-updated', {
        detail: { type, data }
      }))
    } else if (type === 'TAB_ACTIVATED') {
      // Tab切换，更新数据
      const consoleStore = useConsoleStore()
      const networkStore = useNetworkStore()
      consoleStore.updateTabData(data.tabId, data.data.url, data.data)
      networkStore.updateTabData(data.tabId, data.data.url, data.data)
      
      // 触发Tab切换事件
      window.dispatchEvent(new CustomEvent('diflow-tab-changed', {
        detail: { tabId: data.tabId, data: data.data }
      }))
    } else if (type === 'DATA_CLEARED') {
      // 数据清理
      const consoleStore = useConsoleStore()
      const networkStore = useNetworkStore()
      
      if (data.dataType === 'console') {
        consoleStore.clearConsoleData()
      } else if (data.dataType === 'network') {
        networkStore.clearNetworkData()
      } else if (data.dataType === 'all') {
        consoleStore.clearConsoleData()
        networkStore.clearNetworkData()
      }
      
      window.dispatchEvent(new CustomEvent('diflow-data-cleared', {
        detail: { dataType: data.dataType }
      }))
    }
  })
  
  console.log('Chrome extension environment configured')
} else {
  console.log('Running in development mode')
} 