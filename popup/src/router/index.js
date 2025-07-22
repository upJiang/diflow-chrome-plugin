import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@views/Home/index.vue'),
    meta: { title: 'Diflow工具' }
  },
  {
    path: '/console',
    name: 'Console',
    component: () => import('@views/Console/index.vue'),
    meta: { title: 'Console监控' }
  },
  {
    path: '/network',
    name: 'Network', 
    component: () => import('@views/Network/index.vue'),
    meta: { title: '网络监控' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@views/Settings/index.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  // 使用hash模式，更适合Chrome插件环境
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'Diflow Chrome Plugin'
  next()
})

export default router 