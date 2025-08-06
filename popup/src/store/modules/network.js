import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import MessageUtils from '../../utils/messageUtils.js'
import CopyUtils from '../../utils/copyUtils.js'

export const useNetworkStore = defineStore('network', () => {
  // 状态
  const networkData = ref([])
  const loading = ref(false)
  const filterType = ref('all') // all, errors, success
  const selectedRequest = ref(null)
  const currentTabId = ref(null)
  const currentUrl = ref('')
  
  // 计算属性
  const filteredNetworkData = computed(() => {
    if (filterType.value === 'all') {
      return networkData.value
    } else if (filterType.value === 'errors') {
      return networkData.value.filter(req => req.isError)
    } else if (filterType.value === 'success') {
      return networkData.value.filter(req => !req.isError)
    }
    return networkData.value
  })
  
  const errorRequests = computed(() => {
    return networkData.value.filter(req => req.isError)
  })
  
  const successRequests = computed(() => {
    return networkData.value.filter(req => !req.isError)
  })
  
  const errorCount = computed(() => errorRequests.value.length)
  const successCount = computed(() => successRequests.value.length)
  const totalCount = computed(() => networkData.value.length)
  
  const averageResponseTime = computed(() => {
    if (networkData.value.length === 0) return 0
    const total = networkData.value.reduce((sum, req) => sum + req.responseTime, 0)
    return Math.round(total / networkData.value.length)
  })
  
  // 方法
  async function loadNetworkData() {
    loading.value = true
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        const data = await MessageUtils.getCollectedData()
        networkData.value = data.networkData || []
        currentTabId.value = data.tabId
        currentUrl.value = data.url || ''
      } else {
        // 开发环境模拟数据
        networkData.value = generateMockNetworkData()
        currentUrl.value = window.location.href
      }
    } catch (error) {
      console.error('Failed to load network data:', error)
      networkData.value = []
    } finally {
      loading.value = false
    }
  }
  
  function addNetworkRequest(requestData) {
    networkData.value.push(requestData)
    
    // 限制数据量
    if (networkData.value.length > 500) {
      networkData.value.shift()
    }
  }
  
  function updateTabData(tabId, url, data) {
    currentTabId.value = tabId
    currentUrl.value = url
    networkData.value = data.networkData || []
    selectedRequest.value = null
  }
  
  async function clearNetworkData() {
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        await MessageUtils.clearData('network')
      }
      networkData.value = []
      selectedRequest.value = null
    } catch (error) {
      console.error('Failed to clear network data:', error)
    }
  }
  
    async function copyAllErrors() {
    const errors = errorRequests.value
    if (errors.length === 0) {
      return { success: false, message: '没有网络错误可复制' }
    }
    
    const markdownText = CopyUtils.formatNetworkErrorToMarkdown(errors)
    const result = await CopyUtils.copyToClipboard(markdownText)
    
    if (result.success) {
      return { success: true, message: `已复制 ${errors.length} 条错误请求` }
    } else {
      return result
    }
  }

  async function copyRequestDetails(request) {
    if (!request) {
      return { success: false, message: '请求信息不存在' }
    }
    
    const markdownText = CopyUtils.formatNetworkErrorToMarkdown(request)
    return await CopyUtils.copyToClipboard(markdownText)
  }
  
  function setFilter(type) {
    filterType.value = type
  }
  
  function selectRequest(request) {
    selectedRequest.value = request
  }
  
  function getRequestsByStatus(isError) {
    return networkData.value.filter(req => req.isError === isError)
  }
  
  // 生成模拟数据（开发环境使用）
  function generateMockNetworkData() {
    return [
      {
        id: '1',
        timestamp: Date.now() - 30000,
        url: 'https://api.example.com/users',
        method: 'GET',
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'content-length': '1234'
        },
        requestHeaders: {
          'authorization': 'Bearer token123'
        },
        requestBody: null,
        responseBody: '{"users": []}',
        responseTime: 245,
        isError: false
      },
      {
        id: '2',
        timestamp: Date.now() - 20000,
        url: 'https://api.example.com/login',
        method: 'POST',
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'content-type': 'application/json'
        },
        requestHeaders: {
          'content-type': 'application/json'
        },
        requestBody: '{"username":"test","password":"test"}',
        responseBody: '{"error": "Invalid credentials"}',
        responseTime: 156,
        isError: true
      },
      {
        id: '3',
        timestamp: Date.now() - 10000,
        url: 'https://api.example.com/data',
        method: 'GET',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'content-type': 'text/plain'
        },
        requestHeaders: {},
        requestBody: null,
        responseBody: 'Server Error',
        responseTime: 3456,
        isError: true
      }
    ]
  }
  
  return {
    // 状态
    networkData,
    loading,
    filterType,
    selectedRequest,
    currentTabId,
    currentUrl,
    
    // 计算属性
    filteredNetworkData,
    errorRequests,
    successRequests,
    errorCount,
    successCount,
    totalCount,
    averageResponseTime,
    
    // 方法
    loadNetworkData,
    addNetworkRequest,
    updateTabData,
    clearNetworkData,
    copyAllErrors,
    copyRequestDetails,
    setFilter,
    selectRequest,
    getRequestsByStatus
  }
}) 