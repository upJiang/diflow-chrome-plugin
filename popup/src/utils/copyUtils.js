// 通用的Markdown格式复制工具
import MessageUtils from '../../../utils/messageUtils.js'

export class CopyUtils {
  /**
   * 格式化Console错误为Markdown格式
   * @param {Object|Array} data - 单个错误对象或错误数组
   * @returns {string} Markdown格式的文本
   */
  static formatConsoleErrorToMarkdown(data) {
    const errors = Array.isArray(data) ? data : [data]
    if (errors.length === 0) return '# 没有Console错误信息'
    
    let markdown = `# Console错误报告\n\n`
    markdown += `**收集时间**: ${new Date().toLocaleString()}\n`
    markdown += `**错误数量**: ${errors.length}\n\n`
    markdown += `---\n\n`
    
    errors.forEach((error, index) => {
      markdown += `## 错误 ${index + 1}\n\n`
      markdown += `- **时间**: ${new Date(error.timestamp).toLocaleString()}\n`
      markdown += `- **页面**: ${error.url}\n`
      markdown += `- **级别**: \`${error.level.toUpperCase()}\`\n`
      if (error.lineNumber) {
        markdown += `- **行号**: ${error.lineNumber}\n`
      }
      markdown += `\n**错误内容**:\n\`\`\`\n${error.args.join(' ')}\n\`\`\`\n\n`
      
      if (index < errors.length - 1) {
        markdown += `---\n\n`
      }
    })
    
    return markdown
  }

  /**
   * 格式化Network错误为Markdown格式
   * @param {Object|Array} data - 单个请求对象或请求数组
   * @returns {string} Markdown格式的文本
   */
  static formatNetworkErrorToMarkdown(data) {
    const requests = Array.isArray(data) ? data : [data]
    if (requests.length === 0) return '# 没有网络请求错误'
    
    let markdown = `# 网络请求错误报告\n\n`
    markdown += `**收集时间**: ${new Date().toLocaleString()}\n`
    markdown += `**错误数量**: ${requests.length}\n\n`
    markdown += `---\n\n`
    
    requests.forEach((request, index) => {
      markdown += `## 请求错误 ${index + 1}\n\n`
      markdown += `- **时间**: ${new Date(request.timestamp).toLocaleString()}\n`
      markdown += `- **URL**: \`${request.url}\`\n`
      markdown += `- **方法**: \`${request.method}\`\n`
      markdown += `- **状态**: \`${request.status} ${request.statusText}\`\n`
      markdown += `- **响应时间**: ${request.responseTime}ms\n\n`
      
      // 请求头
      markdown += `### 请求头\n\n`
      if (request.requestHeaders && Object.keys(request.requestHeaders).length > 0) {
        markdown += `\`\`\`json\n${JSON.stringify(request.requestHeaders, null, 2)}\n\`\`\`\n\n`
      } else {
        markdown += `*无请求头*\n\n`
      }
      
      // 请求体
      markdown += `### 请求体\n\n`
      if (request.requestBody) {
        try {
          const parsedBody = JSON.parse(request.requestBody)
          markdown += `\`\`\`json\n${JSON.stringify(parsedBody, null, 2)}\n\`\`\`\n\n`
        } catch {
          markdown += `\`\`\`\n${request.requestBody}\n\`\`\`\n\n`
        }
      } else {
        markdown += `*无请求体*\n\n`
      }
      
      // 响应头
      markdown += `### 响应头\n\n`
      if (request.headers && Object.keys(request.headers).length > 0) {
        markdown += `\`\`\`json\n${JSON.stringify(request.headers, null, 2)}\n\`\`\`\n\n`
      } else {
        markdown += `*无响应头*\n\n`
      }
      
      // 响应体
      markdown += `### 响应体\n\n`
      if (request.responseBody) {
        try {
          const parsedResponse = JSON.parse(request.responseBody)
          markdown += `\`\`\`json\n${JSON.stringify(parsedResponse, null, 2)}\n\`\`\`\n\n`
        } catch {
          const truncatedResponse = request.responseBody.length > 1000 
            ? request.responseBody.substring(0, 1000) + '...\n\n*（响应体过长，已截断）*'
            : request.responseBody
          markdown += `\`\`\`\n${truncatedResponse}\n\`\`\`\n\n`
        }
      } else {
        markdown += `*无响应体*\n\n`
      }
      
      if (index < requests.length - 1) {
        markdown += `---\n\n`
      }
    })
    
    return markdown
  }

  /**
   * 格式化混合错误（Console + Network）为Markdown格式
   * @param {Object} options - 选项对象
   * @param {Array} options.consoleErrors - Console错误数组
   * @param {Array} options.networkErrors - Network错误数组
   * @returns {string} Markdown格式的文本
   */
  static formatMixedErrorsToMarkdown({ consoleErrors = [], networkErrors = [] }) {
    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      return '# 没有错误信息'
    }
    
    let markdown = `# 综合错误报告\n\n`
    markdown += `**收集时间**: ${new Date().toLocaleString()}\n`
    markdown += `**Console错误**: ${consoleErrors.length} 条\n`
    markdown += `**Network错误**: ${networkErrors.length} 条\n`
    markdown += `**总计**: ${consoleErrors.length + networkErrors.length} 条\n\n`
    markdown += `---\n\n`
    
    if (consoleErrors.length > 0) {
      markdown += `# Console错误\n\n`
      consoleErrors.forEach((error, index) => {
        markdown += `## Console错误 ${index + 1}\n\n`
        markdown += `- **时间**: ${new Date(error.timestamp).toLocaleString()}\n`
        markdown += `- **页面**: ${error.url}\n`
        markdown += `- **级别**: \`${error.level.toUpperCase()}\`\n`
        if (error.lineNumber) {
          markdown += `- **行号**: ${error.lineNumber}\n`
        }
        markdown += `\n**错误内容**:\n\`\`\`\n${error.args.join(' ')}\n\`\`\`\n\n`
      })
      
      if (networkErrors.length > 0) {
        markdown += `---\n\n`
      }
    }
    
    if (networkErrors.length > 0) {
      markdown += `# 网络请求错误\n\n`
      networkErrors.forEach((request, index) => {
        markdown += `## 网络错误 ${index + 1}\n\n`
        markdown += `- **时间**: ${new Date(request.timestamp).toLocaleString()}\n`
        markdown += `- **URL**: \`${request.url}\`\n`
        markdown += `- **方法**: \`${request.method}\`\n`
        markdown += `- **状态**: \`${request.status} ${request.statusText}\`\n`
        markdown += `- **响应时间**: ${request.responseTime}ms\n\n`
        
        // 只显示关键信息，避免过长
        if (request.requestHeaders && Object.keys(request.requestHeaders).length > 0) {
          markdown += `**请求头**: \`${Object.keys(request.requestHeaders).join(', ')}\`\n`
        }
        if (request.requestBody) {
          markdown += `**请求体**: 有数据 (${request.requestBody.length} 字符)\n`
        }
        if (request.responseBody) {
          markdown += `**响应体**: 有数据 (${request.responseBody.length} 字符)\n`
        }
        markdown += `\n`
      })
    }
    
    return markdown
  }

  /**
   * 通用复制方法
   * @param {string} text - 要复制的文本
   * @returns {Promise<Object>} 复制结果
   */
  static async copyToClipboard(text) {
    try {
      // 直接使用浏览器的clipboard API
      await navigator.clipboard.writeText(text)
      return { success: true, message: '已复制到剪贴板' }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      
      // 如果clipboard API失败，尝试使用execCommand (fallback)
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          return { success: true, message: '已复制到剪贴板' }
        } else {
          return { success: false, message: '复制失败' }
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        return { success: false, message: '复制失败: ' + error.message }
      }
    }
  }
}

export default CopyUtils
