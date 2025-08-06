<template>
  <div class="console-view">
    <!-- 控制栏 -->
    <div class="console-toolbar">
      <div class="toolbar-left">
        <div class="log-filters">
          <button 
            v-for="filter in filters"
            :key="filter.key"
            class="filter-btn"
            :class="{ active: consoleStore.filterType === filter.key }"
            @click="consoleStore.setFilter(filter.key)"
          >
            <span class="filter-icon" :class="filter.key"></span>
            <span class="filter-label">{{ filter.label }}</span>
            <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <button class="tool-btn" @click="copyAllErrors" :disabled="consoleStore.errorCount === 0">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
          </svg>
          复制错误
        </button>
        
        <button class="tool-btn" @click="clearLogs">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
          </svg>
          清除
        </button>
      </div>
    </div>
    
    <!-- 日志列表 -->
    <div class="console-content">
      <div v-if="consoleStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="consoleStore.filteredConsoleData.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M7 14l5-5 5 5z" fill="currentColor"/>
          <path d="M7 10l5 5 5-5z" fill="currentColor"/>
        </svg>
        <h3>暂无Console日志</h3>
        <p>{{ consoleStore.filterType === 'all' ? '页面Console信息将在这里显示' : `当前筛选条件下没有${getFilterLabel(consoleStore.filterType)}日志` }}</p>
      </div>
      
      <div v-else class="console-logs">
        <LogItem
          v-for="log in consoleStore.filteredConsoleData"
          :key="log.id"
          :log="log"
          @copy="copyLog"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useConsoleStore, useAppStore } from '@/store'
import LogItem from './components/LogItem/index.vue'

const consoleStore = useConsoleStore()
const appStore = useAppStore()

// 筛选器配置
const filters = computed(() => [
  {
    key: 'all',
    label: '全部',
    count: consoleStore.totalCount
  },
  {
    key: 'error',
    label: '错误',
    count: consoleStore.errorCount
  },
  {
    key: 'warn',
    label: '警告',
    count: consoleStore.warningCount
  },
  {
    key: 'log',
    label: '日志',
    count: consoleStore.logCount
  },
  {
    key: 'info',
    label: '信息',
    count: consoleStore.getLogsByLevel('info').length
  },
  {
    key: 'debug',
    label: '调试',
    count: consoleStore.getLogsByLevel('debug').length
  }
])

// 数据更新事件监听器
let dataUpdateListener = null
let tabChangeListener = null

onMounted(async () => {
  // 加载初始数据
  await consoleStore.loadConsoleData()
  
  // 监听实时数据更新
  dataUpdateListener = (event) => {
    if (event.detail.type === 'CONSOLE_DATA_UPDATED') {
      console.log('Console data updated:', event.detail.data)
    }
  }
  
  // 监听Tab切换
  tabChangeListener = (event) => {
    console.log('Tab changed:', event.detail)
    consoleStore.loadConsoleData()
  }
  
  window.addEventListener('diflow-data-updated', dataUpdateListener)
  window.addEventListener('diflow-tab-changed', tabChangeListener)
})

onUnmounted(() => {
  if (dataUpdateListener) {
    window.removeEventListener('diflow-data-updated', dataUpdateListener)
  }
  if (tabChangeListener) {
    window.removeEventListener('diflow-tab-changed', tabChangeListener)
  }
})

function getFilterLabel(type) {
  const filter = filters.value.find(f => f.key === type)
  return filter ? filter.label : type
}

async function copyAllErrors() {
  const result = await consoleStore.copyAllErrors()
  appStore.showNotification(result.message, result.success ? 'success' : 'error')
}

async function clearLogs() {
  if (confirm('确定要清除所有Console日志吗？')) {
    await consoleStore.clearConsoleData()
    appStore.showNotification('Console日志已清除', 'success')
  }
}

function copyLog(log) {
  const logText = `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.args.join(' ')}`
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(logText).then(() => {
      appStore.showNotification('日志已复制', 'success', 1500)
    }).catch(() => {
      appStore.showNotification('复制失败', 'error')
    })
  }
}
</script>

<style lang="scss" scoped>
@import './Console.scss';
</style> 