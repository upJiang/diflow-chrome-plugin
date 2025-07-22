<template>
  <div 
    class="request-item" 
    :class="{ 
      'request-item--error': request.isError,
      'request-item--selected': selected 
    }"
    @click="$emit('click', request)"
  >
    <div class="request-method">
      <span class="method-badge" :class="request.method.toLowerCase()">
        {{ request.method }}
      </span>
    </div>
    
    <div class="request-info">
      <div class="request-url" :title="request.url">
        {{ beautifyUrl(request.url) }}
      </div>
      
      <div class="request-meta">
        <span class="status-code" :class="getStatusColor(request.status)">
          {{ request.status }}
        </span>
        <span class="response-time">{{ request.responseTime }}ms</span>
        <span class="request-time">{{ formatTime(request.timestamp, { relative: true }) }}</span>
      </div>
    </div>
    
    <div class="request-actions">
      <button 
        class="action-btn"
        @click.stop="$emit('copy', request)"
        title="复制请求信息"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { formatTime, beautifyUrl, getStatusColor } from '@/utils'

defineProps({
  request: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'copy'])
</script>

<style lang="scss" scoped>
@import './RequestItem.scss';
</style> 