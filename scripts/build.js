import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const popupSrcDir = path.resolve(rootDir, 'popup')

async function buildExtension() {
  console.log('🚀 开始构建Chrome插件...')
  
  try {
    // 1. 清理dist目录
    console.log('🧹 清理构建目录...')
    await fs.remove(distDir)
    await fs.ensureDir(distDir)
    
    // 2. 构建popup前端项目
    console.log('📦 构建popup前端项目...')
    await buildPopup()
    
    // 3. 复制插件核心文件
    console.log('📁 复制插件核心文件...')
    await copyExtensionFiles()
    
    // 4. 生成manifest.json
    console.log('📄 生成manifest.json...')
    await generateManifest()
    
    // 5. 复制图标资源
    console.log('🖼️ 复制图标资源...')
    await copyIcons()
    
    // 6. 验证构建结果
    console.log('✅ 验证构建结果...')
    await validateBuild()
    
    // 7. 创建zip包(可选)
    if (process.argv.includes('--zip')) {
      console.log('📦 创建安装包...')
      await createZip()
    }
    
    console.log('🎉 构建完成！插件位置:', distDir)
    
  } catch (error) {
    console.error('❌ 构建失败:', error)
    process.exit(1)
  }
}

async function buildPopup() {
  const { execSync } = await import('child_process')
  
  // 使用子进程在popup目录中运行构建
  try {
    execSync('yarn build', {
      cwd: popupSrcDir,
      stdio: 'inherit'
    })
  } catch (error) {
    throw new Error(`Popup构建失败: ${error.message}`)
  }
}

async function copyExtensionFiles() {
  // 复制background脚本
  const backgroundDir = path.resolve(rootDir, 'background')
  if (await fs.pathExists(backgroundDir)) {
    await fs.copy(backgroundDir, path.resolve(distDir, 'background'))
  }
  
  // 复制content脚本
  const contentDir = path.resolve(rootDir, 'content')
  if (await fs.pathExists(contentDir)) {
    await fs.copy(contentDir, path.resolve(distDir, 'content'))
  }
  
  // 复制utils
  const utilsDir = path.resolve(rootDir, 'utils')
  if (await fs.pathExists(utilsDir)) {
    await fs.copy(utilsDir, path.resolve(distDir, 'utils'))
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
    
    // 根据环境调整插件名称
    if (process.env.NODE_ENV === 'development') {
      manifestData.name = manifestData.name + ' (Dev)'
      manifestData.action.default_title = manifestData.action.default_title + '(开发版)'
    }
    
    // 写入目标文件
    await fs.writeJson(targetManifest, manifestData, { spaces: 2 })
    
  } catch (error) {
    console.error('❌ 无法读取根目录的 manifest.json:', error.message)
    throw new Error('请确保项目根目录存在 manifest.json 文件')
  }
}

async function copyIcons() {
  const iconsDir = path.resolve(rootDir, 'icons')
  const distIconsDir = path.resolve(distDir, 'icons')
  
  if (await fs.pathExists(iconsDir)) {
    await fs.copy(iconsDir, distIconsDir)
  } else {
    // 确保目标图标目录存在
    await fs.ensureDir(distIconsDir)
    const iconSizes = [16, 48, 128]
    
    let hasValidIcons = true
    for (const size of iconSizes) {
      const iconPath = path.resolve(distIconsDir, `icon${size}.png`)
      
      // 检查文件是否存在且不为空
      if (!await fs.pathExists(iconPath) || (await fs.stat(iconPath)).size === 0) {
        hasValidIcons = false
        // 只在构建时创建占位符（因为构建需要完整的文件）
        await fs.writeFile(iconPath, '')
      }
    }
    
    if (!hasValidIcons) {
      console.log('⚠️ 警告: 未找到有效的图标文件，已创建占位符。请运行 "node create_simple_icons.js" 创建实际图标')
    }
  }
}

async function validateBuild() {
  const requiredFiles = [
    'manifest.json',
    'popup/index.html',
    'background/background.js',
    'content/content.js'
  ]
  
  for (const file of requiredFiles) {
    const filePath = path.resolve(distDir, file)
    if (!await fs.pathExists(filePath)) {
      throw new Error(`必要文件缺失: ${file}`)
    }
  }
  
  console.log('✅ 所有必要文件都已生成')
}

async function createZip() {
  const packageJson = await fs.readJson(path.resolve(rootDir, 'package.json'))
  const version = packageJson.version || '1.0.0'
  const zipPath = path.resolve(rootDir, `diflow-chrome-plugin-v${version}.zip`)
  
  const output = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`📦 安装包已创建: ${zipPath} (${archive.pointer()} bytes)`)
      resolve()
    })
    
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(distDir, false)
    archive.finalize()
  })
}

// 运行构建
buildExtension() 