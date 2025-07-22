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
  const manifestTemplate = {
    "manifest_version": 3,
    "name": "Diflow Chrome Plugin (Dev)",
    "version": "1.0.0",
    "description": "Diflow的chrome插件（开发版本）",
    "permissions": [
      "activeTab",
      "debugger",
      "storage",
      "scripting"
    ],
    "host_permissions": ["<all_urls>"],
    "background": {
      "service_worker": "background/background.js"
    },
    "content_scripts": [{
      "matches": ["<all_urls>"],
      "js": ["content/content.js"],
      "run_at": "document_start"
    }],
    "action": {
      "default_popup": "popup/index.html",
      "default_title": "Diflow工具(开发版)",
      "default_icon": {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    },
    "icons": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "content_security_policy": {
      "extension_pages": "script-src 'self'; object-src 'self';"
    }
  }
  
  await fs.writeJson(
    path.resolve(distDir, 'manifest.json'), 
    manifestTemplate, 
    { spaces: 2 }
  )
}

async function copyIcons() {
  const iconsDir = path.resolve(rootDir, 'icons')
  if (await fs.pathExists(iconsDir)) {
    await fs.copy(iconsDir, path.resolve(distDir, 'icons'))
  } else {
    // 创建默认图标目录
    await fs.ensureDir(path.resolve(distDir, 'icons'))
    const iconSizes = [16, 48, 128]
    
    for (const size of iconSizes) {
      const iconPath = path.resolve(distDir, 'icons', `icon${size}.png`)
      await fs.writeFile(iconPath, '')
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