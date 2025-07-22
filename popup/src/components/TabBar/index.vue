<template>
  <nav class="tab-bar">
    <router-link 
      v-for="tab in tabs" 
      :key="tab.name"
      :to="tab.path"
      class="tab-item"
      :class="{ active: $route.name === tab.name }"
    >
      <div class="tab-icon">
        <component :is="tab.icon" />
      </div>
      <span class="tab-label">{{ tab.label }}</span>
      <div v-if="tab.badge > 0" class="tab-badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</div>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { useConsoleStore, useNetworkStore } from '@/store'

// 图标组件
const HomeIcon = () => h('svg', { viewBox: '0 0 24 24', width: 20, height: 20 }, [
  h('path', { d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', fill: 'currentColor' })
])

const ConsoleIcon = () => h('svg', { viewBox: '0 0 24 24', width: 20, height: 20 }, [
  h('path', { d: 'M7 14l5-5 5 5z', fill: 'currentColor' }),
  h('path', { d: 'M7 10l5 5 5-5z', fill: 'currentColor' })
])

const NetworkIcon = () => h('svg', { viewBox: '0 0 24 24', width: 20, height: 20 }, [
  h('path', { d: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z', fill: 'currentColor' })
])

const SettingsIcon = () => h('svg', { viewBox: '0 0 24 24', width: 20, height: 20 }, [
  h('path', { d: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z', fill: 'currentColor' })
])

const route = useRoute()
const consoleStore = useConsoleStore()
const networkStore = useNetworkStore()

const tabs = computed(() => [
  {
    name: 'Home',
    path: '/',
    label: '首页',
    icon: HomeIcon,
    badge: 0
  },
  {
    name: 'Console',
    path: '/console',
    label: 'Console',
    icon: ConsoleIcon,
    badge: consoleStore.errorCount
  },
  {
    name: 'Network',
    path: '/network',
    label: 'Network',
    icon: NetworkIcon,
    badge: networkStore.errorCount
  },
  {
    name: 'Settings',
    path: '/settings',
    label: '设置',
    icon: SettingsIcon,
    badge: 0
  }
])
</script>

<style lang="scss" scoped>
@import './TabBar.scss';
</style> 