# 笔记应用 📝

现代化的笔记应用，采用 Apple 设计语言，支持 Markdown 渲染、目录导航和 URL 路由。专为 Cloudflare Pages 部署优化。

## ✨ 功能特性

- 🎨 **现代化设计**：采用 Apple 设计语言，简洁美观
- 📄 **Markdown 渲染**：支持完整的 Markdown 语法渲染
- 📁 **目录导航**：自动扫描 docs 目录生成导航结构
- 🔍 **大纲生成**：自动从文档生成导航大纲
- 🔗 **URL 路由**：支持 `#/目录/文件名` 格式的哈希路由
- 📍 **路径显示**：面包屑导航显示当前路径
- 📱 **响应式设计**：完美适配桌面、平板和手机
- 🔄 **实时更新**：监听文件变更，自动更新目录结构
- ⚡ **高性能**：静态部署，快速加载
- 🔒 **安全可靠**：符合现代 Web 安全标准

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd note
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **生成目录结构**
   ```bash
   npm run build
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **打开浏览器**
   访问 `http://localhost:3000`

### 文件监听模式

启动文件监听，当 docs 目录变更时自动重新生成目录结构：
```bash
npm run watch-structure
```

## 📁 项目结构

```
note/
├── generate-directory-structure.js  # 构建脚本
├── package.json                     # 项目配置
├── .npmrc                           # npm配置
├── docs/                            # 原始文档目录
│   ├── draft/                       # 草稿文档
│   ├── linux/                       # Linux相关
│   ├── php/                         # PHP相关
│   ├── python/                      # Python相关
│   ├── services/                    # 服务相关
│   ├── tool/                        # 工具相关
│   └── images/                      # 图片资源
├── public/                          # 部署目录（Cloudflare Pages部署此目录）
│   ├── index.html                   # 主页面
│   ├── styles.css                   # 样式文件
│   ├── script.js                    # 主脚本（包含路由功能）
│   ├── marked.min.js                # Markdown渲染库
│   ├── _redirects                   # Cloudflare重定向规则
│   ├── _headers                     # HTTP头部配置
│   ├── 404.html                     # 404错误页面
│   └── docs/                        # 文档目录（构建时从根目录docs复制）
│       ├── directory-structure.json # 自动生成的目录结构
│       └── [各子目录]/*.md          # Markdown文档
└── README.md                        # 本文档
```

## 🔗 URL 路由系统

应用使用哈希路由（Hash-based routing），无需服务器配置：

### 路由格式
- **首页**：`https://your-domain.com/`
- **文档页面**：`https://your-domain.com/#/linux/vim`
- **目录页面**：`https://your-domain.com/#/linux`（加载该目录第一个文件）

### 功能特点
1. **直接访问**：通过完整 URL 直接访问特定文档
2. **分享链接**：复制浏览器地址栏中的 URL 分享给他人
3. **刷新保持**：刷新页面保持在同一文档
4. **历史记录**：浏览器前进/后退按钮正常工作
5. **路径显示**：面包屑导航显示当前位置

## ☁️ Cloudflare Pages 部署

### 部署步骤

1. **准备项目**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **Cloudflare Dashboard 配置**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages" → "Create application" → "Pages"
   - 选择 "Connect to Git" 连接您的仓库

3. **构建设置**
   ```
   项目名称: note-app（或自定义）
   生产分支: main
   框架预设: None
   构建命令: npm run build
   构建输出目录: public
   根目录: /（默认）
   ```

4. **环境变量**（可选）
   ```
   NODE_VERSION: 18
   ```

5. **开始部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（约 1-2 分钟）

### 验证部署

部署成功后测试：
1. ✅ 应用界面正常显示（Apple 设计风格）
2. ✅ 侧边栏显示文档目录
3. ✅ 点击文档正常加载内容
4. ✅ URL 显示哈希路由格式（如 `/#/linux/vim`）
5. ✅ 刷新页面保持在同一文档
6. ✅ 分享链接给他人能正常访问

## 🛠️ 开发指南

### 添加新文档

1. 在 `docs/` 目录下创建或选择目录
2. 添加 `.md` 文件
3. 运行 `npm run build`
4. 刷新页面即可看到新文档

### 目录结构生成

应用会自动扫描 `docs/` 目录下的所有 `.md` 文件，生成 `directory-structure.json`。

**忽略规则**：
- 忽略目录：`.git`, `node_modules`, `__pycache__`, `images`
- 忽略文件：`.DS_Store`, `directory-structure.json`

### 自定义样式

修改 `public/styles.css` 中的 CSS 变量来自定义主题：
```css
:root {
  --background-color: #ffffff;
  --sidebar-background: #f5f5f7;
  --accent-color: #0071e3;
  /* 更多变量... */
}
```

## 📱 响应式设计

应用支持多种屏幕尺寸：
- **桌面** (> 1200px)：三栏布局
- **平板** (992px - 1200px)：两栏布局（隐藏大纲）
- **手机** (< 768px)：单栏布局

## 🔄 文件变更处理

### 自动更新
应用会定期检查目录结构更新（默认每 30 秒）。当检测到文件变更时：
1. 重新扫描 docs 目录
2. 更新 directory-structure.json
3. 刷新前端导航菜单

### 手动触发
在开发时，可以运行：
```bash
npm run build
```

## 🐛 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   npm run build
   # 检查错误信息
   ```

2. **页面空白**
   - 检查浏览器控制台错误
   - 验证静态资源路径
   - 检查 `index.html` 中的资源引用

3. **目录不显示**
   ```bash
   # 检查 directory-structure.json
   cat public/docs/directory-structure.json
   # 重新生成目录
   npm run build
   ```

4. **部署显示 "hello world"**
   - 确保 Cloudflare Pages 配置中"构建输出目录"设置为 `public`
   - 清除浏览器和 Cloudflare 缓存
   - 重新触发部署

### 调试模式

在浏览器控制台查看调试信息：
```javascript
// 查看应用状态
console.log(AppState);

// 手动重新加载目录
await loadDirectoryStructure();
renderDirectoryNavigation();
```

## 📄 许可证

MIT License

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

**Happy Note-taking!** 📝✨