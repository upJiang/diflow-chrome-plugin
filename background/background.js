// Background Service Worker for Diflow Chrome Plugin

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Diflow Chrome Plugin installed:', details)
  
  // 设置初始存储数据
  chrome.storage.local.set({
    consoleData: [],
    networkData: [],
    settings: {
      enableConsoleMonitor: true,
      enableNetworkMonitor: true,
      autoCollect: true
    }
  })
})

// 监听来自content script和popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)
  
  switch (message.type) {
    case 'CONSOLE_LOG':
      handleConsoleMessage(message.data)
      break
    case 'NETWORK_REQUEST':
      handleNetworkMessage(message.data)
      break
    case 'GET_COLLECTED_DATA':
      getCollectedData().then(sendResponse)
      return true // 表示异步响应
    case 'CLEAR_DATA':
      clearData(message.dataType).then(sendResponse)
      return true
    case 'COPY_TO_CLIPBOARD':
      copyToClipboard(message.text).then(sendResponse)
      return true
    default:
      console.log('Unknown message type:', message.type)
  }
})

// 处理console信息
async function handleConsoleMessage(consoleData) {
  try {
    const result = await chrome.storage.local.get(['consoleData'])
    const existingData = result.consoleData || []
    
    const newData = {
      id: generateId(),
      timestamp: Date.now(),
      level: consoleData.level,
      args: consoleData.args,
      url: consoleData.url,
      lineNumber: consoleData.lineNumber
    }
    
    existingData.push(newData)
    
    // 限制数据量，只保留最新的1000条
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000)
    }
    
    await chrome.storage.local.set({ consoleData: existingData })
    
    // 通知popup更新
    broadcastToPopup('CONSOLE_DATA_UPDATED', newData)
  } catch (error) {
    console.error('Error handling console message:', error)
  }
}

// 处理网络请求信息
async function handleNetworkMessage(networkData) {
  try {
    const result = await chrome.storage.local.get(['networkData'])
    const existingData = result.networkData || []
    
    const newData = {
      id: generateId(),
      timestamp: Date.now(),
      url: networkData.url,
      method: networkData.method,
      status: networkData.status,
      statusText: networkData.statusText,
      headers: networkData.headers,
      requestHeaders: networkData.requestHeaders,
      requestBody: networkData.requestBody,
      responseBody: networkData.responseBody,
      responseTime: networkData.responseTime,
      isError: networkData.status >= 400
    }
    
    existingData.push(newData)
    
    // 限制数据量，只保留最新的500条
    if (existingData.length > 500) {
      existingData.splice(0, existingData.length - 500)
    }
    
    await chrome.storage.local.set({ networkData: existingData })
    
    // 通知popup更新
    broadcastToPopup('NETWORK_DATA_UPDATED', newData)
  } catch (error) {
    console.error('Error handling network message:', error)
  }
}

// 获取收集的数据
async function getCollectedData() {
  try {
    const result = await chrome.storage.local.get(['consoleData', 'networkData'])
    return {
      consoleData: result.consoleData || [],
      networkData: result.networkData || []
    }
  } catch (error) {
    console.error('Error getting collected data:', error)
    return { consoleData: [], networkData: [] }
  }
}

// 清理数据
async function clearData(dataType) {
  try {
    if (dataType === 'console') {
      await chrome.storage.local.set({ consoleData: [] })
    } else if (dataType === 'network') {
      await chrome.storage.local.set({ networkData: [] })
    } else if (dataType === 'all') {
      await chrome.storage.local.set({ consoleData: [], networkData: [] })
    }
    
    broadcastToPopup('DATA_CLEARED', dataType)
    return { success: true }
  } catch (error) {
    console.error('Error clearing data:', error)
    return { success: false, error: error.message }
  }
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    // 使用offscreen document来处理剪贴板操作
    await createOffscreenDocument()
    
    const response = await chrome.runtime.sendMessage({
      type: 'COPY_TO_CLIPBOARD',
      text: text
    })
    
    return response
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return { success: false, error: error.message }
  }
}

// 创建离屏文档用于剪贴板操作
async function createOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return
  
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Copy error information to clipboard'
  })
}

// 广播消息到popup
function broadcastToPopup(type, data) {
  chrome.runtime.sendMessage({
    type: type,
    data: data
  }).catch(() => {
    // Popup可能没有打开，忽略错误
  })
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url)
  }
})

// 处理插件图标点击
chrome.action.onClicked.addListener((tab) => {
  // 这个事件在有default_popup时不会触发
  console.log('Extension icon clicked on tab:', tab.id)
}) 