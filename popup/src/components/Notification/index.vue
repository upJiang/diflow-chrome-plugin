<template>
  <transition name="notification" appear>
    <div class="notification" :class="[`notification--${notification.type}`]">
      <div class="notification-icon">
        <svg v-if="notification.type === 'success'" viewBox="0 0 24 24" width="16" height="16">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
        </svg>
        <svg v-else-if="notification.type === 'error'" viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
        <svg v-else-if="notification.type === 'warning'" viewBox="0 0 24 24" width="16" height="16">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      </div>
      
      <div class="notification-content">
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      
      <button class="notification-close" @click="$emit('close')">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  notification: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])
</script>

<style lang="scss" scoped>
@import './Notification.scss';
</style> 