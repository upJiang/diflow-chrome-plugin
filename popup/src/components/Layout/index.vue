<template>
  <div class="layout">
    <!-- 头部 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="layout-main">
      <slot />
    </main>
    
    <!-- 底部导航 -->
    <TabBar />
  </div>
</template>

<script setup>
import Header from '@components/Header/index.vue'
import TabBar from '@components/TabBar/index.vue'
</script>

<style lang="scss" scoped>
@import './Layout.scss';
</style> 