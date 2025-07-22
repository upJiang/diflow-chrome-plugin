# Diflow Chrome Plugin

Diflow 的 Chrome 浏览器插件，用于获取当前网页的信息，以及小工具的快捷实用。

## 🚀 快速开始

### 安装依赖
```bash
# 安装根目录依赖
yarn install

# 安装所有依赖（包括 popup 前端）
yarn install:all
```

### 开发模式
```bash
# 启动开发模式（自动监听文件变化）
yarn dev

# 单独启动 popup 前端开发服务器
yarn popup:dev
```

### 构建插件
```bash
# 构建插件到 dist 目录
yarn build

# 构建并打包为 zip 文件
yarn build:zip
```

### 创建图标
```bash
# 生成默认的插件图标
node create_simple_icons.js
```

## 📁 项目结构

```
diflow-chrome-plugin/
├── manifest.json          # Chrome 插件配置文件（源文件）
├── create_simple_icons.js # 图标生成脚本
├── popup/                 # Vue 3 前端界面
│   ├── src/              # 前端源码
│   ├── public/           # 静态资源
│   └── package.json      # 前端依赖
├── background/           # 后台服务脚本
├── content/             # 内容脚本（注入网页）
├── utils/               # 通用工具函数
├── scripts/             # 构建脚本
│   ├── build.js         # 生产构建
│   └── dev.js           # 开发构建
└── dist/                # 构建输出（不提交到 git）
```

## 🛠️ Chrome 插件调试

### 1. 启用开发者模式
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 右上角开启「开发者模式」

### 2. 加载插件
1. 点击「加载已解压的扩展程序」
2. 选择项目的 `dist` 目录
3. 插件会出现在扩展程序列表中

### 3. 调试技巧
- **Popup 调试**: 右键点击插件图标 → 检查弹出内容
- **Background 调试**: 在插件管理页面点击「检查视图: 后台页面」
- **Content 脚本调试**: 在目标网页按 F12 → Console 标签页查看日志
- **实时更新**: 修改代码后运行 `yarn dev` 或 `yarn build`，然后在插件管理页面点击「🔄 重新加载」

## 🎨 自定义图标

如果需要自定义图标：

1. 在项目根目录创建 `icons/` 文件夹
2. 放入以下文件：
   - `icon16.png` (16x16 像素)
   - `icon48.png` (48x48 像素) 
   - `icon128.png` (128x128 像素)
3. 重新构建插件

## 🔧 技术栈

- **前端**: Vue 3 + Pinia + Vue Router + SCSS
- **构建**: Vite + Node.js
- **插件**: Chrome Extension Manifest V3
- **开发工具**: ESLint + TypeScript

## 📝 开发注意事项

1. `dist/` 目录不会提交到 git，每次都需要重新构建
2. `manifest.json` 源文件在项目根目录，构建时会自动复制到 `dist/`
3. 开发模式会在插件名称后添加 "(Dev)" 标识
4. 图标文件需要手动生成或提供，使用 `node create_simple_icons.js` 创建默认图标

## 🐛 故障排除

- **构建失败**: 检查 Node.js 版本 (需要 >=16.0.0)
- **插件加载失败**: 确保 `dist/manifest.json` 存在且格式正确
- **图标缺失**: 运行 `node create_simple_icons.js` 创建默认图标
- **样式警告**: Sass 弃用警告不影响功能，可忽略
