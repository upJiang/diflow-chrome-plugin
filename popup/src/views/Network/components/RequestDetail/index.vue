<template>
  <div class="request-detail">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="header-info">
        <h3 class="request-title">{{ request.method }} {{ beautifyUrl(request.url) }}</h3>
        <div class="request-summary">
          <span class="status-code" :class="getStatusColor(request.status)">
            {{ request.status }} {{ request.statusText }}
          </span>
          <span class="response-time">{{ request.responseTime }}ms</span>
          <span class="request-time">{{ formatTime(request.timestamp, { showDate: true }) }}</span>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="action-btn" @click="$emit('copy', request)" title="复制详情">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
          </svg>
        </button>
        
        <button class="action-btn close-btn" @click="$emit('close')" title="关闭">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 详情内容 -->
    <div class="detail-content">
      <!-- 基本信息 -->
      <section class="detail-section">
        <div class="section-header">
          <h4 class="section-title">基本信息</h4>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">URL:</label>
              <span class="info-value selectable">{{ request.url }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">方法:</label>
              <span class="info-value">{{ request.method }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">状态:</label>
              <span class="info-value">{{ request.status }} {{ request.statusText }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">响应时间:</label>
              <span class="info-value">{{ request.responseTime }}ms</span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 请求头 -->
      <section class="detail-section">
        <div class="section-header">
          <h4 class="section-title">请求头</h4>
        </div>
        <div class="section-content">
          <div v-if="hasRequestHeaders" class="headers-list">
            <div 
              v-for="[key, value] in Object.entries(request.requestHeaders || {})"
              :key="key"
              class="header-item"
            >
              <span class="header-key">{{ key }}:</span>
              <span class="header-value selectable">{{ value }}</span>
            </div>
          </div>
          <div v-else class="empty-content">
            <span>无请求头信息</span>
          </div>
        </div>
      </section>
      
      <!-- 请求体 -->
      <section v-if="request.requestBody" class="detail-section">
        <div class="section-header">
          <h4 class="section-title">请求体</h4>
        </div>
        <div class="section-content">
          <div class="code-content selectable">
            <pre>{{ formatRequestBody(request.requestBody) }}</pre>
          </div>
        </div>
      </section>
      
      <!-- 响应头 -->
      <section class="detail-section">
        <div class="section-header">
          <h4 class="section-title">响应头</h4>
        </div>
        <div class="section-content">
          <div v-if="hasResponseHeaders" class="headers-list">
            <div 
              v-for="[key, value] in Object.entries(request.headers || {})"
              :key="key"
              class="header-item"
            >
              <span class="header-key">{{ key }}:</span>
              <span class="header-value selectable">{{ value }}</span>
            </div>
          </div>
          <div v-else class="empty-content">
            <span>无响应头信息</span>
          </div>
        </div>
      </section>
      
      <!-- 响应体 -->
      <section v-if="request.responseBody" class="detail-section">
        <div class="section-header">
          <h4 class="section-title">响应体</h4>
        </div>
        <div class="section-content">
          <div class="code-content selectable">
            <pre>{{ formatResponseBody(request.responseBody) }}</pre>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime, beautifyUrl, getStatusColor, prettyJSON } from '@/utils'

const props = defineProps({
  request: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'copy'])

const hasRequestHeaders = computed(() => {
  return props.request.requestHeaders && Object.keys(props.request.requestHeaders).length > 0
})

const hasResponseHeaders = computed(() => {
  return props.request.headers && Object.keys(props.request.headers).length > 0
})

function formatRequestBody(body) {
  if (!body) return ''
  
  try {
    const parsed = JSON.parse(body)
    return prettyJSON(parsed)
  } catch {
    return body
  }
}

function formatResponseBody(body) {
  if (!body) return ''
  
  // 限制显示长度
  if (body.length > 10000) {
    return body.substring(0, 10000) + '\n\n... (内容过长，已截断)'
  }
  
  try {
    const parsed = JSON.parse(body)
    return prettyJSON(parsed)
  } catch {
    return body
  }
}
</script>

<style lang="scss" scoped>
@import './RequestDetail.scss';
</style> 