import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import MessageUtils from '../../utils/messageUtils.js'

export const useNetworkStore = defineStore('network', () => {
  // 状态
  const networkData = ref([])
  const loading = ref(false)
  const filterType = ref('all') // all, errors, success
  const selectedRequest = ref(null)
  
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
      } else {
        // 开发环境模拟数据
        networkData.value = generateMockNetworkData()
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
    
    const formattedData = MessageUtils.formatNetworkDataForCopy(errors)
    
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        const result = await MessageUtils.copyToClipboard(formattedData)
        return result.success 
          ? { success: true, message: `已复制 ${errors.length} 条错误请求` }
          : { success: false, message: '复制失败' }
      } else {
        // 开发环境使用浏览器API
        await navigator.clipboard.writeText(formattedData)
        return { success: true, message: `已复制 ${errors.length} 条错误请求` }
      }
    } catch (error) {
      console.error('Failed to copy errors:', error)
      return { success: false, message: '复制失败: ' + error.message }
    }
  }
  
  async function copyRequestDetails(request) {
    const formattedData = MessageUtils.formatSingleRequestForCopy(request)
    
    try {
      if (MessageUtils.isExtensionEnvironment()) {
        const result = await MessageUtils.copyToClipboard(formattedData)
        return result.success 
          ? { success: true, message: '请求详情已复制' }
          : { success: false, message: '复制失败' }
      } else {
        await navigator.clipboard.writeText(formattedData)
        return { success: true, message: '请求详情已复制' }
      }
    } catch (error) {
      console.error('Failed to copy request details:', error)
      return { success: false, message: '复制失败: ' + error.message }
    }
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
    clearNetworkData,
    copyAllErrors,
    copyRequestDetails,
    setFilter,
    selectRequest,
    getRequestsByStatus
  }
}) 