// Message Utils for Diflow Chrome Plugin - Popup Version
// 统一的消息传递工具函数

export class MessageUtils {
  // 发送消息到background
  static async sendToBackground(type, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ type, data }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve(response)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 发送消息到content script
  static async sendToContent(tabId, type, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.sendMessage(tabId, { type, data }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve(response)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 获取当前活动标签页
  static async getCurrentTab() {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve(tabs[0])
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 监听background消息
  static onBackgroundMessage(callback) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      callback(message, sender, sendResponse)
    })
  }
  
  // 获取收集的数据
  static async getCollectedData() {
    return this.sendToBackground('GET_COLLECTED_DATA')
  }
  
  // 清理数据
  static async clearData(dataType) {
    return this.sendToBackground('CLEAR_DATA', { dataType })
  }
  
  // 复制到剪贴板
  static async copyToClipboard(text) {
    return this.sendToBackground('COPY_TO_CLIPBOARD', { text })
  }
  
  // 格式化console数据用于复制
  static formatConsoleDataForCopy(consoleData) {
    if (!Array.isArray(consoleData)) return ''
    
    const errorLogs = consoleData.filter(log => log.level === 'error')
    if (errorLogs.length === 0) return '没有错误信息'
    
    let output = `=== Console错误信息汇总 ===\n`
    output += `收集时间: ${new Date().toLocaleString()}\n`
    output += `错误数量: ${errorLogs.length}\n\n`
    
    errorLogs.forEach((log, index) => {
      output += `【错误 ${index + 1}】\n`
      output += `时间: ${new Date(log.timestamp).toLocaleString()}\n`
      output += `页面: ${log.url}\n`
      if (log.lineNumber) {
        output += `行号: ${log.lineNumber}\n`
      }
      output += `内容: ${log.args.join(' ')}\n`
      output += `${'='.repeat(50)}\n`
    })
    
    return output
  }
  
  // 格式化网络请求数据用于复制
  static formatNetworkDataForCopy(networkData) {
    if (!Array.isArray(networkData)) return ''
    
    const errorRequests = networkData.filter(req => req.isError)
    if (errorRequests.length === 0) return '没有网络错误'
    
    let output = `=== 网络请求错误汇总 ===\n`
    output += `收集时间: ${new Date().toLocaleString()}\n`
    output += `错误数量: ${errorRequests.length}\n\n`
    
    errorRequests.forEach((req, index) => {
      output += `【请求错误 ${index + 1}】\n`
      output += `时间: ${new Date(req.timestamp).toLocaleString()}\n`
      output += `URL: ${req.url}\n`
      output += `方法: ${req.method}\n`
      output += `状态: ${req.status} ${req.statusText}\n`
      output += `耗时: ${req.responseTime}ms\n`
      
      if (req.requestHeaders && Object.keys(req.requestHeaders).length > 0) {
        output += `请求头:\n`
        Object.entries(req.requestHeaders).forEach(([key, value]) => {
          output += `  ${key}: ${value}\n`
        })
      }
      
      if (req.requestBody) {
        output += `请求体: ${req.requestBody}\n`
      }
      
      if (req.headers && Object.keys(req.headers).length > 0) {
        output += `响应头:\n`
        Object.entries(req.headers).forEach(([key, value]) => {
          output += `  ${key}: ${value}\n`
        })
      }
      
      if (req.responseBody) {
        output += `响应体: ${req.responseBody.substring(0, 500)}${req.responseBody.length > 500 ? '...' : ''}\n`
      }
      
      output += `${'='.repeat(50)}\n`
    })
    
    return output
  }
  
  // 格式化单个请求数据
  static formatSingleRequestForCopy(request) {
    let output = `=== 网络请求详情 ===\n`
    output += `时间: ${new Date(request.timestamp).toLocaleString()}\n`
    output += `URL: ${request.url}\n`
    output += `方法: ${request.method}\n`
    output += `状态: ${request.status} ${request.statusText}\n`
    output += `耗时: ${request.responseTime}ms\n\n`
    
    output += `请求头:\n`
    if (request.requestHeaders && Object.keys(request.requestHeaders).length > 0) {
      Object.entries(request.requestHeaders).forEach(([key, value]) => {
        output += `  ${key}: ${value}\n`
      })
    } else {
      output += `  (无)\n`
    }
    
    output += `\n请求体:\n`
    output += request.requestBody || '(无)'
    
    output += `\n\n响应头:\n`
    if (request.headers && Object.keys(request.headers).length > 0) {
      Object.entries(request.headers).forEach(([key, value]) => {
        output += `  ${key}: ${value}\n`
      })
    } else {
      output += `  (无)\n`
    }
    
    output += `\n响应体:\n`
    output += request.responseBody || '(无)'
    
    return output
  }
  
  // 检查Chrome扩展环境
  static isExtensionEnvironment() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
  }
}

export default MessageUtils 