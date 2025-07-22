import fs from 'fs'
import path from 'path'

// 创建简单的 SVG 图标
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#1976d2"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
        fill="white" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold">D</text>
</svg>`
}

// 创建图标文件
const iconsDir = path.resolve('./dist/icons')
const sizes = [16, 48, 128]

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// 生成 SVG 图标（作为临时方案）
sizes.forEach(size => {
  const svgContent = createSVGIcon(size)
  const svgPath = path.join(iconsDir, `icon${size}.svg`)
  fs.writeFileSync(svgPath, svgContent)
  console.log(`Created ${svgPath}`)
})

console.log('图标创建完成！注意：Chrome 插件需要 PNG 格式图标。')
console.log('请将这些 SVG 文件转换为 PNG 格式，或者使用在线工具生成图标。') 