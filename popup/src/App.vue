<template>
  <div id="app" :class="{ 'dark-theme': appStore.isDarkTheme }">
    <!-- 加载状态 -->
    <div v-if="appStore.loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- 主布局 -->
    <Layout v-else>
      <!-- 路由视图 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </Layout>
    
    <!-- 全局通知 -->
    <Notification 
      v-if="appStore.notification" 
      :notification="appStore.notification"
      @close="appStore.hideNotification"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore, useConsoleStore, useNetworkStore } from '@/store'
import Layout from '@components/Layout/index.vue'
import Notification from '@components/Notification/index.vue'

const appStore = useAppStore()
const consoleStore = useConsoleStore()
const networkStore = useNetworkStore()

onMounted(async () => {
  console.log('Diflow App mounted')
  
  try {
    appStore.setLoading(true)
    
    // 加载设置
    await appStore.loadSettings()
    
    // 加载初始数据
    await Promise.all([
      consoleStore.loadConsoleData(),
      networkStore.loadNetworkData()
    ])
    
    // 监听数据更新事件
    window.addEventListener('diflow-data-updated', handleDataUpdate)
    window.addEventListener('diflow-data-cleared', handleDataClear)
    
  } catch (error) {
    console.error('App initialization failed:', error)
    appStore.showNotification('初始化失败', 'error')
  } finally {
    appStore.setLoading(false)
  }
})

function handleDataUpdate(event) {
  const { type, data } = event.detail
  
  if (type === 'CONSOLE_DATA_UPDATED') {
    consoleStore.addConsoleLog(data)
  } else if (type === 'NETWORK_DATA_UPDATED') {
    networkStore.addNetworkRequest(data)
  }
}

function handleDataClear(event) {
  const { dataType } = event.detail
  
  if (dataType === 'console' || dataType === 'all') {
    consoleStore.consoleData = []
  }
  
  if (dataType === 'network' || dataType === 'all') {
    networkStore.networkData = []
  }
  
  appStore.showNotification('数据已清除', 'success')
}
</script>

<style lang="scss">
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  @include center-flex;
  z-index: $z-index-modal;
  
  .loading-spinner {
    @include loading-spinner;
    width: 32px;
    height: 32px;
  }
}
</style> 