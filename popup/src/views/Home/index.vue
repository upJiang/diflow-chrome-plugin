<template>
  <div class="home-view">
    <!-- 欢迎区域 -->
    <section class="welcome-section">
      <div class="welcome-header">
        <h1 class="welcome-title">Diflow 开发工具</h1>
        <p class="welcome-subtitle">实时监控网页Console和Network请求</p>
      </div>
      
      <div class="quick-actions">
        <button class="action-btn primary" @click="openDiflowWebsite">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/>
          </svg>
          访问 Diflow 官网
        </button>
      </div>
    </section>
    
    <!-- 统计概览 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" @click="$router.push('/console')">
          <div class="stat-icon console">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M7 14l5-5 5 5z" fill="currentColor"/>
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ consoleStore.totalCount }}</div>
            <div class="stat-label">Console 日志</div>
            <div class="stat-detail">
              <span class="error-count">{{ consoleStore.errorCount }} 错误</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card" @click="$router.push('/network')">
          <div class="stat-icon network">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="currentColor"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ networkStore.totalCount }}</div>
            <div class="stat-label">网络请求</div>
            <div class="stat-detail">
              <span class="error-count">{{ networkStore.errorCount }} 错误</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 最近错误 -->
    <section v-if="recentErrors.length > 0" class="recent-errors-section">
      <div class="section-header">
        <h2 class="section-title">最近错误</h2>
        <button class="view-all-btn" @click="$router.push('/console')">
          查看全部
        </button>
      </div>
      
      <div class="error-list">
        <div 
          v-for="error in recentErrors" 
          :key="error.id"
          class="error-item"
        >
          <div class="error-type">
            {{ error.type === 'console' ? 'Console' : 'Network' }}
          </div>
          <div class="error-content">
            <div class="error-message">{{ error.message }}</div>
            <div class="error-time">{{ formatTime(error.timestamp) }}</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 快捷操作 -->
    <section class="actions-section">
      <div class="section-header">
        <h2 class="section-title">快捷操作</h2>
      </div>
      
      <div class="action-list">
        <button class="action-item" @click="copyAllErrors">
          <div class="action-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
          </div>
          <div class="action-content">
            <div class="action-title">复制所有错误</div>
            <div class="action-desc">将所有错误信息复制到剪贴板</div>
          </div>
        </button>
        
        <button class="action-item" @click="clearAllData">
          <div class="action-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
          </div>
          <div class="action-content">
            <div class="action-title">清除所有数据</div>
            <div class="action-desc">清除所有收集的Console和Network数据</div>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useConsoleStore, useNetworkStore } from '@/store'

const router = useRouter()
const appStore = useAppStore()
const consoleStore = useConsoleStore()
const networkStore = useNetworkStore()

// 最近错误信息
const recentErrors = computed(() => {
  const consoleErrors = consoleStore.getLogsByLevel('error')
    .slice(-3)
    .map(error => ({
      id: error.id,
      type: 'console',
      message: error.args.join(' '),
      timestamp: error.timestamp
    }))
  
  const networkErrors = networkStore.errorRequests
    .slice(-3)
    .map(error => ({
      id: error.id,
      type: 'network',
      message: `${error.method} ${error.url} - ${error.status}`,
      timestamp: error.timestamp
    }))
  
  return [...consoleErrors, ...networkErrors]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
})

function formatTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else {
    return new Date(timestamp).toLocaleTimeString()
  }
}

function openDiflowWebsite() {
  appStore.openDiflowWebsite()
}

async function copyAllErrors() {
  try {
    appStore.setLoading(true)
    
    const consoleResult = await consoleStore.copyAllErrors()
    const networkResult = await networkStore.copyAllErrors()
    
    if (consoleResult.success || networkResult.success) {
      appStore.showNotification('错误信息已复制到剪贴板', 'success')
    } else {
      appStore.showNotification('没有错误信息可复制', 'info')
    }
  } catch (error) {
    appStore.showNotification('复制失败', 'error')
  } finally {
    appStore.setLoading(false)
  }
}

async function clearAllData() {
  try {
    appStore.setLoading(true)
    
    await Promise.all([
      consoleStore.clearConsoleData(),
      networkStore.clearNetworkData()
    ])
    
    appStore.showNotification('所有数据已清除', 'success')
  } catch (error) {
    appStore.showNotification('清除数据失败', 'error')
  } finally {
    appStore.setLoading(false)
  }
}
</script>

<style lang="scss" scoped>
@import './Home.scss';
</style> 