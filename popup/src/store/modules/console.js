import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import MessageUtils from '../../utils/messageUtils.js'

export const useConsoleStore = defineStore('console', () => {
  // 状态
  const consoleData = ref([])
  const loading = ref(false)
  const filterType = ref('all')
  
  // 计算属性
  const filteredConsoleData = computed(() => {
    if (filterType.value === 'all') {
      return consoleData.value
    }
    return consoleData.value.filter(log => log.level === filterType.value)
  })
  
  const errorCount = computed(() => {
    return consoleData.value.filter(log => log.level === 'error').length
  })
  
  const warningCount = computed(() => {
    return consoleData.value.filter(log => log.level === 'warn').length
  })
  
  const logCount = computed(() => {
    return consoleData.value.filter(log => log.level === 'log').length
  })
  
  const totalCount = computed(() => consoleData.value.length)
  
  // 方法
  async function loadConsoleData() {
    loading.value = true
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        const data = await MessageUtils.getCollectedData()
        consoleData.value = data.consoleData || []
      } else {
        // 开发环境模拟数据
        consoleData.value = generateMockConsoleData()
      }
    } catch (error) {
      console.error('Failed to load console data:', error)
      consoleData.value = []
    } finally {
      loading.value = false
    }
  }
  
  function addConsoleLog(logData) {
    consoleData.value.push(logData)
    
    // 限制数据量
    if (consoleData.value.length > 1000) {
      consoleData.value.shift()
    }
  }
  
  async function clearConsoleData() {
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        await MessageUtils.clearData('console')
      }
      consoleData.value = []
    } catch (error) {
      console.error('Failed to clear console data:', error)
    }
  }
  
  async function copyAllErrors() {
    const errorLogs = consoleData.value.filter(log => log.level === 'error')
    if (errorLogs.length === 0) {
      return { success: false, message: '没有错误信息可复制' }
    }
    
    const formattedData = MessageUtils.formatConsoleDataForCopy(errorLogs)
    
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        const result = await MessageUtils.copyToClipboard(formattedData)
        return result.success 
          ? { success: true, message: `已复制 ${errorLogs.length} 条错误信息` }
          : { success: false, message: '复制失败' }
      } else {
        // 开发环境使用浏览器API
        await navigator.clipboard.writeText(formattedData)
        return { success: true, message: `已复制 ${errorLogs.length} 条错误信息` }
      }
    } catch (error) {
      console.error('Failed to copy errors:', error)
      return { success: false, message: '复制失败: ' + error.message }
    }
  }
  
  function setFilter(type) {
    filterType.value = type
  }
  
  function getLogsByLevel(level) {
    return consoleData.value.filter(log => log.level === level)
  }
  
  // 生成模拟数据（开发环境使用）
  function generateMockConsoleData() {
    return [
      {
        id: '1',
        timestamp: Date.now() - 30000,
        level: 'error',
        args: ['Uncaught ReferenceError: undefined variable'],
        url: 'https://example.com',
        lineNumber: 42
      },
      {
        id: '2',
        timestamp: Date.now() - 20000,
        level: 'warn',
        args: ['Warning: Deprecated API usage'],
        url: 'https://example.com',
        lineNumber: 38
      },
      {
        id: '3',
        timestamp: Date.now() - 10000,
        level: 'log',
        args: ['Application initialized successfully'],
        url: 'https://example.com',
        lineNumber: 15
      },
      {
        id: '4',
        timestamp: Date.now() - 5000,
        level: 'error',
        args: ['Network request failed'],
        url: 'https://example.com',
        lineNumber: 67
      }
    ]
  }
  
  return {
    // 状态
    consoleData,
    loading,
    filterType,
    
    // 计算属性
    filteredConsoleData,
    errorCount,
    warningCount,
    logCount,
    totalCount,
    
    // 方法
    loadConsoleData,
    addConsoleLog,
    clearConsoleData,
    copyAllErrors,
    setFilter,
    getLogsByLevel
  }
}) 