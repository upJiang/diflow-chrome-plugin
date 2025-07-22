import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentTab = ref('home')
  const loading = ref(false)
  const notification = ref(null)
  const theme = ref('light')
  const settings = ref({
    enableConsoleMonitor: true,
    enableNetworkMonitor: true,
    autoCollect: true,
    maxConsoleItems: 1000,
    maxNetworkItems: 500
  })
  
  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark')
  
  // 方法
  function setCurrentTab(tab) {
    currentTab.value = tab
  }
  
  function setLoading(state) {
    loading.value = state
  }
  
  function showNotification(message, type = 'info', duration = 3000) {
    notification.value = {
      message,
      type, // info, success, warning, error
      timestamp: Date.now()
    }
    
    if (duration > 0) {
      setTimeout(() => {
        hideNotification()
      }, duration)
    }
  }
  
  function hideNotification() {
    notification.value = null
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    
    // 应用主题到document
    document.documentElement.setAttribute('data-theme', theme.value)
  }
  
  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    
    // 保存到Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'diflow-settings': settings.value })
    }
  }
  
  async function loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['diflow-settings'])
        if (result['diflow-settings']) {
          settings.value = { ...settings.value, ...result['diflow-settings'] }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
  
  function openDiflowWebsite() {
    const url = 'https://diflow.xyz'
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url })
    } else {
      // 开发环境打开新窗口
      window.open(url, '_blank')
    }
  }
  
  return {
    // 状态
    currentTab,
    loading,
    notification,
    theme,
    settings,
    
    // 计算属性
    isDarkTheme,
    
    // 方法
    setCurrentTab,
    setLoading,
    showNotification,
    hideNotification,
    toggleTheme,
    updateSettings,
    loadSettings,
    openDiflowWebsite
  }
}) 