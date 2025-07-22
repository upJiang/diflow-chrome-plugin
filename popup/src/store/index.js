import { createPinia } from 'pinia'

// 导入store模块
export { useConsoleStore } from './modules/console'
export { useNetworkStore } from './modules/network'
export { useAppStore } from './modules/app'

const pinia = createPinia()

export default pinia 