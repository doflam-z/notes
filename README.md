# 笔记应用 📝

现代化的笔记应用，采用 Apple 设计语言，支持 Markdown 渲染和目录导航。专为 Cloudflare Pages 部署优化。

## ✨ 功能特性

- 🎨 **现代化设计**：采用 Apple 设计语言，简洁美观
- 📄 **Markdown 渲染**：支持完整的 Markdown 语法渲染
- 📁 **目录导航**：自动扫描 docs 目录生成导航结构
- 🔍 **大纲生成**：自动从文档生成导航大纲
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
   npm run generate-structure
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
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 主脚本文件
├── marked.min.js       # Markdown 渲染库
├── docs/               # 文档目录
│   ├── draft/          # 草稿文档
│   ├── linux/          # Linux 相关文档
│   ├── php/            # PHP 相关文档
│   ├── python/         # Python 相关文档
│   ├── services/       # 服务相关文档
│   ├── tool/           # 工具相关文档
│   └── directory-structure.json  # 自动生成的目录结构
├── generate-directory-structure.js  # 目录生成脚本
├── package.json        # 项目配置
├── wrangler.toml       # Cloudflare Pages 配置
├── _headers            # 自定义 HTTP 头部
├── _redirects          # 重定向规则
└── 404.html            # 404 错误页面
```

## ☁️ Cloudflare Pages 部署

### 自动部署（推荐）

1. **连接 GitHub 仓库**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 Pages → "Create a project"
   - 选择 "Connect to Git"

2. **配置构建设置**
   - **构建命令**: `npm run build`
   - **构建输出目录**: `.` (当前目录)
   - **根目录**: `/` (默认)

3. **环境变量**（可选）
   - `NODE_VERSION`: `18` (推荐)

4. **开始部署**
   - 点击 "Save and Deploy"

### 手动部署

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **部署到 Cloudflare Pages**
   ```bash
   wrangler pages deploy .
   ```

### 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 选择 "Custom domains"
3. 添加您的域名
4. 按照提示配置 DNS 记录

## 🔧 配置说明

### 目录结构生成

应用会自动扫描 `docs/` 目录下的所有 `.md` 文件，生成 `directory-structure.json`。

**忽略规则**：
- 忽略目录：`.git`, `node_modules`, `__pycache__`, `images`
- 忽略文件：`.DS_Store`, `directory-structure.json`

### 自定义样式

修改 `styles.css` 中的 CSS 变量来自定义主题：

```css
:root {
  --background-color: #ffffff;
  --sidebar-background: #f5f5f7;
  --accent-color: #0071e3;
  /* 更多变量... */
}
```

### 缓存策略

- **静态资源**：CSS、JS 文件缓存 1 年
- **文档文件**：Markdown 文件缓存 5 分钟
- **目录结构**：JSON 文件缓存 5 分钟

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
npm run generate-structure
```

## 🛠️ 开发指南

### 添加新文档

1. 在 `docs/` 目录下创建或选择目录
2. 添加 `.md` 文件
3. 运行 `npm run generate-structure`
4. 刷新页面即可看到新文档

### 扩展功能

#### 添加搜索功能
1. 集成 [lunr.js](https://lunrjs.com/) 或 [FlexSearch](https://github.com/nextapps-de/flexsearch)
2. 在构建时生成搜索索引
3. 在前端添加搜索界面

#### 添加代码高亮
1. 集成 [Prism.js](https://prismjs.com/) 或 [highlight.js](https://highlightjs.org/)
2. 在 `script.js` 中初始化高亮
3. 添加对应的 CSS 主题

#### 添加暗色模式
1. 在 `styles.css` 中添加暗色主题变量
2. 使用 `prefers-color-scheme` 媒体查询
3. 添加主题切换按钮

## 📄 文档规范

### Markdown 格式建议

```markdown
# 文档标题

## 二级标题
- 使用清晰的标题结构
- 标题会自动生成大纲

### 三级标题
代码块使用三个反引号：

```python
def hello():
    print("Hello, World!")
```

- 列表项
- 另一个列表项

> 引用内容

**粗体** *斜体* `行内代码`

[链接文本](链接地址)
```

### 文件名规范
- 使用英文或拼音命名
- 使用连字符或下划线分隔单词
- 保持文件名简洁明了

## 🐛 故障排除

### 常见问题

1. **目录不显示**
   - 检查 `docs/directory-structure.json` 是否存在
   - 运行 `npm run generate-structure`
   - 检查浏览器控制台错误

2. **Markdown 渲染问题**
   - 检查 `marked.min.js` 是否加载
   - 验证 Markdown 语法是否正确

3. **部署失败**
   - 检查 `package.json` 中的构建命令
   - 验证 Cloudflare Pages 配置
   - 查看构建日志中的错误信息

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

## 📞 支持

如有问题或建议，请：
1. 查看 [Issues](https://github.com/your-repo/issues)
2. 提交新的 Issue
3. 或通过邮件联系

---

**Happy Note-taking!** 📝✨