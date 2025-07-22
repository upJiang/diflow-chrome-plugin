import { spawn, execSync } from 'child_process'
import chokidar from 'chokidar'
import { debounce } from 'lodash-es'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

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

function startDevMode() {
  console.log('🚀 启动开发模式...')
  
  // 初始构建
  devBuild()
  
  // 监听文件变化
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
  
  console.log('👀 正在监听文件变化...')
  console.log('💡 修改完文件后，请在Chrome扩展页面手动刷新插件')
  console.log('📝 访问 chrome://extensions/ 然后点击插件的刷新按钮')
}

startDevMode() 