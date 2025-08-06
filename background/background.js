// Background Service Worker for Diflow Chrome Plugin

// 存储每个Tab的数据
const tabData = new Map()

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Diflow Chrome Plugin installed:', details)
  
  // 设置初始存储数据
  chrome.storage.local.set({
    settings: {
      enableConsoleMonitor: true,
      enableNetworkMonitor: true,
      autoCollect: true
    }
  })
})

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tabId, tab.url)
    
    // 初始化Tab数据
    if (!tabData.has(tabId)) {
      tabData.set(tabId, {
        consoleData: [],
        networkData: [],
        url: tab.url,
        lastUpdated: Date.now()
      })
    } else {
      // 更新Tab信息
      const data = tabData.get(tabId)
      const oldUrl = data.url
      data.url = tab.url
      data.lastUpdated = Date.now()
      
      // 如果URL变化，清空旧数据
      if (oldUrl !== tab.url) {
        console.log(`URL changed for tab ${tabId}: ${oldUrl} -> ${tab.url}, clearing data`)
        data.consoleData = []
        data.networkData = []
      }
    }
    
    // 通知content script重新初始化
    chrome.tabs.sendMessage(tabId, {
      type: 'TAB_UPDATED',
      data: { url: tab.url }
    }).catch(() => {
      // Content script可能还没有加载，忽略错误
    })
  }
})

// 监听标签页激活
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId)
  
  // 通知popup当前激活的Tab
  broadcastToPopup('TAB_ACTIVATED', {
    tabId: activeInfo.tabId,
    data: tabData.get(activeInfo.tabId) || { consoleData: [], networkData: [] }
  })
})

// 监听标签页关闭
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab removed:', tabId)
  
  // 清理Tab数据
  tabData.delete(tabId)
})

// 监听来自content script和popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from tab:', sender.tab?.id)
  
  const tabId = sender.tab?.id
  
  switch (message.type) {
    case 'CONSOLE_LOG':
      handleConsoleMessage(message.data, tabId)
      break
    case 'NETWORK_REQUEST':
      handleNetworkMessage(message.data, tabId)
      break
    case 'GET_COLLECTED_DATA':
      getCollectedData(message.tabId || tabId).then(sendResponse)
      return true // 表示异步响应
    case 'CLEAR_DATA':
      clearData(message.dataType, tabId).then(sendResponse)
      return true
    case 'COPY_TO_CLIPBOARD':
      copyToClipboard(message.text).then(sendResponse)
      return true
    case 'GET_CURRENT_TAB_DATA':
      getCurrentTabData().then(sendResponse)
      return true
    default:
      console.log('Unknown message type:', message.type)
  }
})

// 处理console信息
async function handleConsoleMessage(consoleData, tabId) {
  try {
    if (!tabId) {
      console.warn('No tabId provided for console message')
      return
    }
    
    // 获取或创建Tab数据
    if (!tabData.has(tabId)) {
      tabData.set(tabId, {
        consoleData: [],
        networkData: [],
        url: consoleData.url,
        lastUpdated: Date.now()
      })
    }
    
    const tabInfo = tabData.get(tabId)
    
    const newData = {
      id: generateId(),
      timestamp: Date.now(),
      level: consoleData.level,
      args: consoleData.args,
      url: consoleData.url,
      lineNumber: consoleData.lineNumber
    }
    
    tabInfo.consoleData.push(newData)
    tabInfo.lastUpdated = Date.now()
    
    // 限制数据量，只保留最新的1000条
    if (tabInfo.consoleData.length > 1000) {
      tabInfo.consoleData.splice(0, tabInfo.consoleData.length - 1000)
    }
    
    // 通知popup更新
    broadcastToPopup('CONSOLE_DATA_UPDATED', {
      tabId: tabId,
      data: newData,
      totalCount: tabInfo.consoleData.length
    })
    
    console.log(`Console data added for tab ${tabId}:`, newData.level)
  } catch (error) {
    console.error('Error handling console message:', error)
  }
}

// 处理网络请求信息
async function handleNetworkMessage(networkData, tabId) {
  try {
    if (!tabId) {
      console.warn('No tabId provided for network message')
      return
    }
    
    // 获取或创建Tab数据
    if (!tabData.has(tabId)) {
      tabData.set(tabId, {
        consoleData: [],
        networkData: [],
        url: networkData.url,
        lastUpdated: Date.now()
      })
    }
    
    const tabInfo = tabData.get(tabId)
    
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
    
    tabInfo.networkData.push(newData)
    tabInfo.lastUpdated = Date.now()
    
    // 限制数据量，只保留最新的500条
    if (tabInfo.networkData.length > 500) {
      tabInfo.networkData.splice(0, tabInfo.networkData.length - 500)
    }
    
    // 通知popup更新
    broadcastToPopup('NETWORK_DATA_UPDATED', {
      tabId: tabId,
      data: newData,
      totalCount: tabInfo.networkData.length
    })
    
    console.log(`Network data added for tab ${tabId}:`, newData.method, newData.url, newData.status)
  } catch (error) {
    console.error('Error handling network message:', error)
  }
}

// 获取收集的数据
async function getCollectedData(tabId) {
  try {
    if (!tabId) {
      // 如果没有指定tabId，获取当前激活的Tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs.length > 0) {
        tabId = tabs[0].id
      }
    }
    
    const tabInfo = tabData.get(tabId) || {
      consoleData: [],
      networkData: [],
      url: '',
      lastUpdated: Date.now()
    }
    
    return {
      tabId: tabId,
      consoleData: tabInfo.consoleData || [],
      networkData: tabInfo.networkData || [],
      url: tabInfo.url,
      lastUpdated: tabInfo.lastUpdated
    }
  } catch (error) {
    console.error('Error getting collected data:', error)
    return { consoleData: [], networkData: [], tabId: null }
  }
}

// 获取当前Tab数据
async function getCurrentTabData() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs.length === 0) {
      return { consoleData: [], networkData: [], tabId: null }
    }
    
    const tabId = tabs[0].id
    return await getCollectedData(tabId)
  } catch (error) {
    console.error('Error getting current tab data:', error)
    return { consoleData: [], networkData: [], tabId: null }
  }
}

// 清理数据
async function clearData(dataType, tabId) {
  try {
    if (!tabId) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs.length > 0) {
        tabId = tabs[0].id
      }
    }
    
    if (!tabId || !tabData.has(tabId)) {
      return { success: false, error: 'No active tab found' }
    }
    
    const tabInfo = tabData.get(tabId)
    
    if (dataType === 'console') {
      tabInfo.consoleData = []
    } else if (dataType === 'network') {
      tabInfo.networkData = []
    } else if (dataType === 'all') {
      tabInfo.consoleData = []
      tabInfo.networkData = []
    }
    
    tabInfo.lastUpdated = Date.now()
    
    broadcastToPopup('DATA_CLEARED', { dataType, tabId })
    return { success: true }
  } catch (error) {
    console.error('Error clearing data:', error)
    return { success: false, error: error.message }
  }
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    // 直接返回文本，让popup处理复制
    return { success: true, text: text }
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return { success: false, error: error.message }
  }
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

// 处理插件图标点击
chrome.action.onClicked.addListener((tab) => {
  // 这个事件在有default_popup时不会触发
  console.log('Extension icon clicked on tab:', tab.id)
}) 