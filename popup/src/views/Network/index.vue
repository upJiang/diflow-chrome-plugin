<template>
  <div class="network-view">
    <!-- 控制栏 -->
    <div class="network-toolbar">
      <div class="toolbar-left">
        <div class="request-filters">
          <button 
            v-for="filter in filters"
            :key="filter.key"
            class="filter-btn"
            :class="{ active: networkStore.filterType === filter.key }"
            @click="networkStore.setFilter(filter.key)"
          >
            <span class="filter-label">{{ filter.label }}</span>
            <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <div class="stats">
          <span class="stat-item">
            平均耗时: {{ networkStore.averageResponseTime }}ms
          </span>
        </div>
        
        <button class="tool-btn" @click="copyAllErrors" :disabled="networkStore.errorCount === 0">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
          </svg>
          复制错误
        </button>
        
        <button class="tool-btn" @click="clearRequests">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
          </svg>
          清除
        </button>
      </div>
    </div>
    
    <!-- 请求列表 -->
    <div class="network-content">
      <div v-if="networkStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="networkStore.filteredNetworkData.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="currentColor"/>
        </svg>
        <h3>暂无网络请求</h3>
        <p>{{ networkStore.filterType === 'all' ? '页面网络请求将在这里显示' : `当前筛选条件下没有${getFilterLabel(networkStore.filterType)}请求` }}</p>
      </div>
      
      <div v-else class="network-requests">
        <div class="request-list">
          <RequestItem
            v-for="request in networkStore.filteredNetworkData"
            :key="request.id"
            :request="request"
            :selected="networkStore.selectedRequest?.id === request.id"
            @click="selectRequest"
            @copy="copyRequest"
          />
        </div>
        
        <!-- 请求详情面板 -->
        <div v-if="networkStore.selectedRequest" class="request-detail">
          <RequestDetail 
            :request="networkStore.selectedRequest"
            @close="networkStore.selectRequest(null)"
            @copy="copyRequestDetail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useNetworkStore, useAppStore } from '@/store'
import RequestItem from './components/RequestItem/index.vue'
import RequestDetail from './components/RequestDetail/index.vue'

const networkStore = useNetworkStore()
const appStore = useAppStore()

// 筛选器配置
const filters = computed(() => [
  {
    key: 'all',
    label: '全部',
    count: networkStore.totalCount
  },
  {
    key: 'errors',
    label: '错误',
    count: networkStore.errorCount
  },
  {
    key: 'success',
    label: '成功',
    count: networkStore.successCount
  }
])

// 数据更新事件监听器
let dataUpdateListener = null
let tabChangeListener = null

onMounted(async () => {
  // 加载初始数据
  await networkStore.loadNetworkData()
  
  // 监听实时数据更新
  dataUpdateListener = (event) => {
    if (event.detail.type === 'NETWORK_DATA_UPDATED') {
      console.log('Network data updated:', event.detail.data)
    }
  }
  
  // 监听Tab切换
  tabChangeListener = (event) => {
    console.log('Tab changed:', event.detail)
    networkStore.loadNetworkData()
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

function selectRequest(request) {
  networkStore.selectRequest(request)
}

async function copyAllErrors() {
  const result = await networkStore.copyAllErrors()
  appStore.showNotification(result.message, result.success ? 'success' : 'error')
}

async function clearRequests() {
  if (confirm('确定要清除所有网络请求记录吗？')) {
    await networkStore.clearNetworkData()
    appStore.showNotification('网络请求记录已清除', 'success')
  }
}

function copyRequest(request) {
  const requestText = `${request.method} ${request.url} - ${request.status} ${request.statusText} (${request.responseTime}ms)`
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(requestText).then(() => {
      appStore.showNotification('请求信息已复制', 'success', 1500)
    }).catch(() => {
      appStore.showNotification('复制失败', 'error')
    })
  }
}

async function copyRequestDetail(request) {
  const result = await networkStore.copyRequestDetails(request)
  appStore.showNotification(result.message, result.success ? 'success' : 'error')
}
</script>

<style lang="scss" scoped>
@import './Network.scss';
</style> 