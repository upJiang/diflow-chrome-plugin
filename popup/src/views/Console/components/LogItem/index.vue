<template>
  <div class="log-item" :class="[`log-item--${log.level}`]">
    <div class="log-meta">
      <span class="log-time">{{ formatTime(log.timestamp) }}</span>
      <span class="log-level">{{ log.level.toUpperCase() }}</span>
    </div>
    
    <div class="log-content">
      <div class="log-message selectable">
        <span v-for="(arg, index) in log.args" :key="index" class="log-arg">
          {{ arg }}{{ index < log.args.length - 1 ? ' ' : '' }}
        </span>
      </div>
      
      <div class="log-source" v-if="log.url || log.lineNumber">
        <span class="source-url">{{ beautifyUrl(log.url) }}</span>
        <span v-if="log.lineNumber" class="source-line">:{{ log.lineNumber }}</span>
      </div>
    </div>
    
    <div class="log-actions">
      <button 
        class="action-btn"
        @click="$emit('copy', log)"
        title="复制日志"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { formatTime, beautifyUrl } from '@/utils'

defineProps({
  log: {
    type: Object,
    required: true
  }
})

defineEmits(['copy'])
</script>

<style lang="scss" scoped>
@import './LogItem.scss';
</style> 