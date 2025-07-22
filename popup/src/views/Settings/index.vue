<template>
  <div class="settings-view">
    <!-- 设置头部 -->
    <div class="settings-header">
      <h1 class="settings-title">设置</h1>
      <p class="settings-subtitle">配置 Diflow 插件的行为和偏好</p>
    </div>
    
    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 监控设置 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">监控设置</h2>
        </div>
        
        <div class="setting-items">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">Console监控</div>
              <div class="setting-desc">自动收集页面的Console输出信息</div>
            </div>
            <div class="setting-control">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="localSettings.enableConsoleMonitor"
                  @change="handleSettingChange"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">网络监控</div>
              <div class="setting-desc">自动收集页面的网络请求信息</div>
            </div>
            <div class="setting-control">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="localSettings.enableNetworkMonitor"
                  @change="handleSettingChange"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">自动收集</div>
              <div class="setting-desc">页面加载时自动开始收集数据</div>
            </div>
            <div class="setting-control">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="localSettings.autoCollect"
                  @change="handleSettingChange"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 数据设置 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">数据设置</h2>
        </div>
        
        <div class="setting-items">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">最大Console条数</div>
              <div class="setting-desc">最多保存的Console日志数量</div>
            </div>
            <div class="setting-control">
              <select 
                v-model="localSettings.maxConsoleItems"
                @change="handleSettingChange"
                class="select-input"
              >
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
                <option value="5000">5000</option>
              </select>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">最大网络请求数</div>
              <div class="setting-desc">最多保存的网络请求数量</div>
            </div>
            <div class="setting-control">
              <select 
                v-model="localSettings.maxNetworkItems"
                @change="handleSettingChange"
                class="select-input"
              >
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 主题设置 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">外观设置</h2>
        </div>
        
        <div class="setting-items">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">暗色主题</div>
              <div class="setting-desc">切换暗色/亮色主题</div>
            </div>
            <div class="setting-control">
              <label class="switch">
                <input 
                  type="checkbox" 
                  :checked="appStore.isDarkTheme"
                  @change="appStore.toggleTheme"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 操作区域 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">数据管理</h2>
        </div>
        
        <div class="action-buttons">
          <button class="action-btn secondary" @click="exportData">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
            </svg>
            导出数据
          </button>
          
          <button class="action-btn danger" @click="clearAllData">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
            清除所有数据
          </button>
        </div>
      </section>
      
      <!-- 关于信息 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">关于</h2>
        </div>
        
        <div class="about-info">
          <div class="about-item">
            <span class="about-label">版本</span>
            <span class="about-value">v1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">官网</span>
            <button class="link-btn" @click="openDiflowWebsite">diflow.xyz</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore, useConsoleStore, useNetworkStore } from '@/store'

const appStore = useAppStore()
const consoleStore = useConsoleStore()
const networkStore = useNetworkStore()

// 本地设置状态
const localSettings = ref({
  enableConsoleMonitor: true,
  enableNetworkMonitor: true,
  autoCollect: true,
  maxConsoleItems: 1000,
  maxNetworkItems: 500
})

onMounted(() => {
  // 初始化本地设置
  localSettings.value = { ...appStore.settings }
})

function handleSettingChange() {
  // 更新全局设置
  appStore.updateSettings(localSettings.value)
  appStore.showNotification('设置已保存', 'success', 2000)
}

function openDiflowWebsite() {
  appStore.openDiflowWebsite()
}

async function exportData() {
  try {
    const data = {
      timestamp: Date.now(),
      version: '1.0.0',
      consoleData: consoleStore.consoleData,
      networkData: networkStore.networkData
    }
    
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // 创建下载链接
    const a = document.createElement('a')
    a.href = url
    a.download = `diflow-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    appStore.showNotification('数据导出成功', 'success')
  } catch (error) {
    console.error('Export failed:', error)
    appStore.showNotification('导出失败', 'error')
  }
}

async function clearAllData() {
  if (!confirm('确定要清除所有数据吗？此操作不可撤销。')) {
    return
  }
  
  try {
    await Promise.all([
      consoleStore.clearConsoleData(),
      networkStore.clearNetworkData()
    ])
    
    appStore.showNotification('所有数据已清除', 'success')
  } catch (error) {
    console.error('Clear failed:', error)
    appStore.showNotification('清除失败', 'error')
  }
}
</script>

<style lang="scss" scoped>
@import './Settings.scss';
</style> 