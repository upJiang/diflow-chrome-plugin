// Content Script for Diflow Chrome Plugin
// 注入到每个页面中，监听console和网络请求

(function() {
  'use strict'
  
  // 避免重复注入
  if (window.diflowInjected) {
    return
  }
  window.diflowInjected = true
  
  console.log('Diflow Chrome Plugin content script loaded')
  
  // 保存原始的console方法
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  }
  
  // 监听console输出
  function setupConsoleMonitoring() {
    const consoleTypes = ['log', 'warn', 'error', 'info', 'debug']
    
    consoleTypes.forEach(type => {
      console[type] = function(...args) {
        // 调用原始方法
        originalConsole[type].apply(console, args)
        
        // 发送消息到background
        try {
          chrome.runtime.sendMessage({
            type: 'CONSOLE_LOG',
            data: {
              level: type,
              args: args.map(arg => {
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2)
                  } catch (e) {
                    return String(arg)
                  }
                }
                return String(arg)
              }),
              url: window.location.href,
              lineNumber: getStackTraceLineNumber(),
              timestamp: Date.now()
            }
          })
        } catch (error) {
          // 静默处理错误，避免影响原页面
        }
      }
    })
  }
  
  // 监听网络请求
  function setupNetworkMonitoring() {
    // 监听XMLHttpRequest
    const originalXHR = window.XMLHttpRequest
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR()
      const startTime = Date.now()
      
      // 存储请求信息
      let requestData = {
        url: '',
        method: 'GET',
        headers: {},
        body: null
      }
      
      // 重写open方法
      const originalOpen = xhr.open
      xhr.open = function(method, url, ...args) {
        requestData.method = method
        requestData.url = url
        return originalOpen.apply(this, [method, url, ...args])
      }
      
      // 重写setRequestHeader方法
      const originalSetRequestHeader = xhr.setRequestHeader
      xhr.setRequestHeader = function(header, value) {
        requestData.headers[header] = value
        return originalSetRequestHeader.apply(this, [header, value])
      }
      
      // 重写send方法
      const originalSend = xhr.send
      xhr.send = function(body) {
        requestData.body = body
        return originalSend.apply(this, [body])
      }
      
      // 监听响应
      xhr.addEventListener('loadend', function() {
        const endTime = Date.now()
        
        try {
          chrome.runtime.sendMessage({
            type: 'NETWORK_REQUEST',
            data: {
              url: requestData.url,
              method: requestData.method,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseResponseHeaders(xhr.getAllResponseHeaders()),
              requestHeaders: requestData.headers,
              requestBody: requestData.body,
              responseBody: xhr.responseText,
              responseTime: endTime - startTime,
              timestamp: startTime
            }
          })
        } catch (error) {
          // 静默处理错误
        }
      })
      
      return xhr
    }
    
    // 监听Fetch API
    const originalFetch = window.fetch
    window.fetch = function(input, init = {}) {
      const startTime = Date.now()
      const url = typeof input === 'string' ? input : input.url
      const method = init.method || 'GET'
      
      return originalFetch.apply(this, [input, init])
        .then(response => {
          const endTime = Date.now()
          
          // 克隆响应以读取内容
          const clonedResponse = response.clone()
          
          // 尝试读取响应内容
          clonedResponse.text().then(responseText => {
            try {
              chrome.runtime.sendMessage({
                type: 'NETWORK_REQUEST',
                data: {
                  url: url,
                  method: method,
                  status: response.status,
                  statusText: response.statusText,
                  headers: Object.fromEntries(response.headers.entries()),
                  requestHeaders: init.headers || {},
                  requestBody: init.body,
                  responseBody: responseText,
                  responseTime: endTime - startTime,
                  timestamp: startTime
                }
              })
            } catch (error) {
              // 静默处理错误
            }
          }).catch(() => {
            // 如果无法读取响应内容，发送不包含内容的数据
            try {
              chrome.runtime.sendMessage({
                type: 'NETWORK_REQUEST',
                data: {
                  url: url,
                  method: method,
                  status: response.status,
                  statusText: response.statusText,
                  headers: Object.fromEntries(response.headers.entries()),
                  requestHeaders: init.headers || {},
                  requestBody: init.body,
                  responseBody: '[Unable to read response]',
                  responseTime: endTime - startTime,
                  timestamp: startTime
                }
              })
            } catch (error) {
              // 静默处理错误
            }
          })
          
          return response
        })
        .catch(error => {
          const endTime = Date.now()
          
          try {
            chrome.runtime.sendMessage({
              type: 'NETWORK_REQUEST',
              data: {
                url: url,
                method: method,
                status: 0,
                statusText: 'Network Error',
                headers: {},
                requestHeaders: init.headers || {},
                requestBody: init.body,
                responseBody: error.message,
                responseTime: endTime - startTime,
                timestamp: startTime
              }
            })
          } catch (err) {
            // 静默处理错误
          }
          
          throw error
        })
    }
  }
  
  // 解析响应头
  function parseResponseHeaders(headersString) {
    const headers = {}
    if (!headersString) return headers
    
    const lines = headersString.trim().split('\n')
    lines.forEach(line => {
      const parts = line.split(':')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').trim()
        headers[key] = value
      }
    })
    
    return headers
  }
  
  // 获取调用栈中的行号
  function getStackTraceLineNumber() {
    try {
      const stack = new Error().stack
      const lines = stack.split('\n')
      // 查找第一个不是插件相关的行
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i]
        if (line && !line.includes('chrome-extension://')) {
          const match = line.match(/:(\d+):\d+/)
          if (match) {
            return parseInt(match[1])
          }
        }
      }
    } catch (e) {
      // 忽略错误
    }
    return null
  }
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ status: 'alive' })
    }
  })
  
  // 初始化监听器
  function initialize() {
    try {
      setupConsoleMonitoring()
      setupNetworkMonitoring()
      console.log('Diflow monitoring initialized')
    } catch (error) {
      console.error('Failed to initialize Diflow monitoring:', error)
    }
  }
  
  // 等待DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize)
  } else {
    initialize()
  }
  
})(); 