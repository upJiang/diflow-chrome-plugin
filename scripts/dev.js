import { spawn, execSync } from 'child_process'
import chokidar from 'chokidar'
import { debounce } from 'lodash-es'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import net from 'net'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

// 开发服务器配置
const DEV_PORT = 3000
const HMR_PORT = 3001

// 检查端口是否被占用
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false)
      })
      server.close()
    })
    server.on('error', () => {
      resolve(true)
    })
  })
}

// 杀死占用端口的进程
async function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' })
      execSync(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`, { stdio: 'pipe' })
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'pipe' })
    }
    console.log(`✅ 已清理端口 ${port} 的占用进程`)
  } catch (error) {
    console.log(`⚠️ 端口 ${port} 清理失败:`, error.message)
  }
}

// 开发模式构建函数
const devBuild = debounce(async () => {
  console.log('🔄 开发模式重新构建...')
  
  try {
    // 确保dist目录存在
    await fs.ensureDir(distDir)
    
    // 构建popup (开发模式)
    try {
      execSync('yarn build', {
        cwd: path.resolve(rootDir, 'popup'),
        stdio: 'inherit'
      })
    } catch (error) {
      throw new Error(`Popup构建失败: ${error.message}`)
    }
    
    // 复制其他文件
    await copyExtensionFiles()
    await generateManifest()
    await copyIcons()
    
    console.log('✅ 开发构建完成')
  } catch (error) {
    console.error('❌ 构建失败:', error)
  }
}, 500)

async function copyExtensionFiles() {
  const filesToCopy = [
    { from: 'background', to: 'background' },
    { from: 'content', to: 'content' },
    { from: 'utils', to: 'utils' }
  ]
  
  for (const { from, to } of filesToCopy) {
    const fromPath = path.resolve(rootDir, from)
    if (await fs.pathExists(fromPath)) {
      await fs.copy(fromPath, path.resolve(distDir, to))
    }
  }
}

async function generateManifest() {
  const sourceManifest = path.resolve(rootDir, 'manifest.json')
  const targetManifest = path.resolve(distDir, 'manifest.json')
  
  try {
    // 读取根目录的 manifest.json
    const manifestData = await fs.readJson(sourceManifest)
    
    // 读取 package.json 获取版本信息
    try {
      const packageJson = await fs.readJson(path.resolve(rootDir, 'package.json'))
      manifestData.version = packageJson.version || "1.0.0"
    } catch (error) {
      console.log('⚠️ 无法读取package.json，使用manifest中的默认版本')
    }
    
    // 开发模式标识
    manifestData.name = manifestData.name + ' (Dev)'
    manifestData.action.default_title = manifestData.action.default_title + '(开发版)'
    
    // 写入目标文件
    await fs.writeJson(targetManifest, manifestData, { spaces: 2 })
    
  } catch (error) {
    console.error('❌ 无法读取根目录的 manifest.json:', error.message)
    throw new Error('请确保项目根目录存在 manifest.json 文件')
  }
}

async function copyIcons() {
  const publicIconsDir = path.resolve(rootDir, 'public/icons')
  const legacyIconsDir = path.resolve(rootDir, 'icons') // 保持向后兼容
  const distIconsDir = path.resolve(distDir, 'icons')
  
  // 确保目标图标目录存在
  await fs.ensureDir(distIconsDir)
  
  if (await fs.pathExists(publicIconsDir)) {
    // 优先使用 public/icons 目录
    await fs.copy(publicIconsDir, distIconsDir)
  } else if (await fs.pathExists(legacyIconsDir)) {
    // 兼容旧的 icons 目录
    await fs.copy(legacyIconsDir, distIconsDir)
  } else {
    // 检查是否已有有效图标
    const iconSizes = [16, 48, 128]
    
    for (const size of iconSizes) {
      const iconPath = path.resolve(distIconsDir, `icon${size}.png`)
      
      if (!await fs.pathExists(iconPath) || (await fs.stat(iconPath)).size === 0) {
        console.log(`⚠️ 警告: 图标 icon${size}.png 不存在。请运行 'node create_simple_icons.js' 创建图标`)
        // 开发模式不创建空文件，让用户主动生成
      }
    }
  }
}

// 启动popup开发服务器
async function startPopupDevServer() {
  console.log('🌐 检查端口占用情况...')
  
  // 检查端口是否被占用
  const devPortInUse = await isPortInUse(DEV_PORT)
  const hmrPortInUse = await isPortInUse(HMR_PORT)
  
  if (devPortInUse) {
    console.log(`⚠️ 端口 ${DEV_PORT} 被占用，正在清理...`)
    await killProcessOnPort(DEV_PORT)
  }
  
  if (hmrPortInUse) {
    console.log(`⚠️ 端口 ${HMR_PORT} 被占用，正在清理...`)
    await killProcessOnPort(HMR_PORT)
  }
  
  console.log('🌐 启动Popup开发服务器...')
  
  const popupDir = path.resolve(rootDir, 'popup')
  
  const popupDevServer = spawn('yarn', ['dev'], {
    cwd: popupDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  })
  
  popupDevServer.stdout.on('data', (data) => {
    const output = data.toString()
    // 过滤掉一些冗余信息，只显示重要的
    if (output.includes('Local:') || output.includes('ready in') || output.includes('localhost')) {
      console.log(`[Popup Dev] ${output.trim()}`)
    }
  })
  
  popupDevServer.stderr.on('data', (data) => {
    const error = data.toString()
    if (!error.includes('Deprecation Warning')) {
      console.error(`[Popup Dev Error] ${error.trim()}`)
    }
  })
  
  popupDevServer.on('error', (error) => {
    console.error('❌ Popup开发服务器启动失败:', error)
  })
  
  return popupDevServer
}

async function startDevMode() {
  console.log('🚀 启动开发模式...')
  console.log('=' .repeat(60))
  
  // 1. 启动popup开发服务器
  const popupDevServer = await startPopupDevServer()
  
  // 2. 初始构建插件
  console.log('🔧 构建Chrome插件到dist目录...')
  devBuild()
  
  // 3. 监听文件变化
  const watcher = chokidar.watch([
    'popup/src/**/*',
    'background/**/*',
    'content/**/*',
    'utils/**/*'
  ], {
    ignored: /node_modules/,
    ignoreInitial: true
  })
  
  watcher.on('change', (filePath) => {
    console.log(`📁 文件变化: ${filePath}`)
    devBuild()
  })
  
  // 4. 显示开发说明
  setTimeout(() => {
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 开发环境已启动！')
    console.log('')
    console.log('📝 开发方式：')
    console.log('  1. Vue组件开发: http://localhost:3000 (热重载)')
    console.log('  2. Chrome插件测试: 加载dist目录到chrome://extensions/')
    console.log('')
    console.log('🔄 使用说明：')
    console.log('  • popup组件修改会自动热重载（访问localhost:3000）')
    console.log('  • 插件功能修改需要在Chrome扩展页面手动刷新插件')
    console.log('  • 按Ctrl+C停止开发服务器')
    console.log('=' .repeat(60))
  }, 2000)
  
  // 5. 优雅退出处理
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止开发服务器...')
    popupDevServer.kill()
    watcher.close()
    process.exit(0)
  })
}

startDevMode() 