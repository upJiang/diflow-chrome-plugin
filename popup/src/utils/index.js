// 工具函数入口文件
export { MessageUtils as default } from './messageUtils.js'

// 时间格式化函数
export function formatTime(timestamp, options = {}) {
  const {
    showDate = false,
    showSeconds = true,
    relative = false
  } = options
  
  const date = new Date(timestamp)
  const now = new Date()
  
  if (relative) {
    const diff = now - date
    
    if (diff < 1000) {
      return '刚刚'
    } else if (diff < 60000) {
      return `${Math.floor(diff / 1000)}秒前`
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${Math.floor(diff / 86400000)}天前`
    }
  }
  
  let timeStr = showSeconds 
    ? date.toLocaleTimeString() 
    : date.toLocaleTimeString().replace(/:\d{2}$/, '')
  
  if (showDate) {
    return date.toLocaleDateString() + ' ' + timeStr
  }
  
  return timeStr
}

// 文件大小格式化
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// HTTP状态码描述
export function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  }
  
  return statusTexts[status] || 'Unknown'
}

// 获取状态码颜色类
export function getStatusColor(status) {
  if (status >= 200 && status < 300) {
    return 'success'
  } else if (status >= 300 && status < 400) {
    return 'warning'
  } else if (status >= 400) {
    return 'error'
  }
  return 'default'
}

// URL美化
export function beautifyUrl(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname + urlObj.search
  } catch {
    return url
  }
}

// 深度克隆
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 防抖函数
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 生成唯一ID
export function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// JSON美化
export function prettyJSON(obj, indent = 2) {
  try {
    return JSON.stringify(obj, null, indent)
  } catch {
    return String(obj)
  }
} 