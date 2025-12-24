# Cloudflare Pages 部署指南

本文档详细说明如何将笔记应用部署到 Cloudflare Pages。

## 📋 前提条件

1. **Cloudflare 账户**
   - 注册 [Cloudflare](https://dash.cloudflare.com/sign-up)
   - 验证邮箱

2. **Git 仓库**
   - GitHub、GitLab 或 Bitbucket 账户
   - 项目已推送到远程仓库

3. **本地环境**
   - Node.js 16+ 
   - Git
   - 代码编辑器

## 🚀 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

#### 步骤 1：准备项目
```bash
# 确保项目可以正常构建
cd /path/to/note
npm run build

# 检查生成的文件
ls -la docs/directory-structure.json
```

#### 步骤 2：推送到 Git 仓库
```bash
git add .
git commit -m "准备 Cloudflare Pages 部署"
git push origin main
```

#### 步骤 3：Cloudflare Dashboard 配置

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录您的账户

2. **创建 Pages 项目**
   - 侧边栏选择 "Workers & Pages"
   - 点击 "Create application" → "Pages"
   - 选择 "Connect to Git"

3. **连接 Git 仓库**
   - 选择您的 Git 提供商（GitHub/GitLab/Bitbucket）
   - 授权 Cloudflare 访问仓库
   - 选择要部署的仓库

4. **配置构建设置**
   ```
   项目名称: note-app（或自定义名称）
   
   构建设置:
   - 生产分支: main（或您的主分支）
   - 框架预设: None
   - 构建命令: npm run build
   - 构建输出目录: .
   - 根目录: /（默认）
   ```

5. **环境变量**（可选）
   - 点击 "Environment variables"
   - 添加变量（如果需要）：
     ```
     NODE_VERSION: 18
     ENVIRONMENT: production
     ```

6. **开始部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（约 1-2 分钟）

7. **获取部署 URL**
   - 构建成功后，会显示部署 URL
   - 格式：`https://<project-name>.<pages.dev>`
   - 点击 URL 访问部署的应用

### 方法二：使用 Wrangler CLI

#### 步骤 1：安装 Wrangler
```bash
npm install -g wrangler
```

#### 步骤 2：登录 Cloudflare
```bash
wrangler login
# 按照提示在浏览器中完成认证
```

#### 步骤 3：配置项目
```bash
cd /path/to/note

# 检查 wrangler.toml 配置
cat wrangler.toml

# 如果需要，更新配置
# 编辑 wrangler.toml 文件
```

#### 步骤 4：构建项目
```bash
npm run build
```

#### 步骤 5：部署到 Cloudflare Pages
```bash
# 部署到生产环境
wrangler pages deploy .

# 或指定项目名称
wrangler pages deploy . --project-name=note-app
```

#### 步骤 6：查看部署状态
```bash
# 列出所有部署
wrangler pages deployment list

# 查看特定部署详情
wrangler pages deployment get <deployment-id>
```

## ⚙️ 高级配置

### 自定义域名

1. **在 Cloudflare Dashboard 中**
   - 进入 Pages 项目
   - 选择 "Custom domains"
   - 点击 "Set up a custom domain"

2. **添加域名**
   - 输入您的域名（如 `notes.yourdomain.com`）
   - 按照提示配置 DNS 记录

3. **SSL/TLS 证书**
   - Cloudflare 会自动提供 SSL 证书
   - 证书会自动续期

### 环境配置

#### 生产环境
```toml
# wrangler.toml
[env.production]
vars = { 
  ENVIRONMENT = "production",
  API_BASE_URL = "https://api.yourdomain.com"
}
```

#### 预览环境
```bash
# 部署到预览环境
wrangler pages deploy . --env=preview

# 或创建预览部署
wrangler pages deployment create --env=preview
```

### 构建优化

#### 缓存配置
编辑 `_headers` 文件调整缓存策略：
```nginx
# 延长静态资源缓存
*.css
  Cache-Control: public, max-age=31536000, immutable

*.js
  Cache-Control: public, max-age=31536000, immutable
```

#### 构建钩子
在 `package.json` 中添加构建前后脚本：
```json
{
  "scripts": {
    "prebuild": "echo '开始构建...'",
    "build": "node generate-directory-structure.js",
    "postbuild": "echo '构建完成！'"
  }
}
```

### 监控和日志

#### 查看构建日志
1. 在 Cloudflare Dashboard 中
2. 进入 Pages 项目
3. 选择 "Deployments"
4. 点击特定部署查看日志

#### 错误监控
1. **Cloudflare Analytics**
   - 查看页面访问统计
   - 监控错误率

2. **自定义错误页面**
   - `404.html` 已配置
   - 可添加 `500.html` 等错误页面

## 🔄 持续集成

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 'note-app'
          directory: '.'
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 环境变量配置
在 GitHub 仓库设置中添加 Secrets：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 🐛 故障排除

### 常见问题

#### 1. 构建失败
**症状**：部署时构建失败
**解决**：
```bash
# 本地测试构建
npm run build

# 检查错误信息
# 常见问题：
# - Node.js 版本不兼容
# - 缺少依赖
# - 脚本权限问题
```

#### 2. 页面空白
**症状**：部署成功但页面空白
**解决**：
1. 检查浏览器控制台错误
2. 验证静态资源路径
3. 检查 `index.html` 中的资源引用

#### 3. 目录不显示
**症状**：页面加载但目录为空
**解决**：
```bash
# 检查 directory-structure.json
cat docs/directory-structure.json

# 重新生成目录
npm run generate-structure

# 检查 docs 目录权限
ls -la docs/
```

#### 4. Markdown 不渲染
**症状**：显示原始 Markdown 代码
**解决**：
1. 检查 `marked.min.js` 是否加载
2. 验证网络请求
3. 检查控制台 JavaScript 错误

### 调试工具

#### Cloudflare Pages 调试
```bash
# 查看部署详情
wrangler pages deployment get <deployment-id>

# 查看项目配置
wrangler pages project list
```

#### 本地调试
```bash
# 启动本地服务器
npm run dev

# 检查网络请求
# 打开浏览器开发者工具 → Network
```

## 📈 性能优化

### 1. 图片优化
- 使用 WebP 格式
- 添加懒加载
- 使用 CDN 加速

### 2. 代码分割
- 按需加载 JavaScript
- 使用动态导入

### 3. 缓存策略
- 合理配置 `_headers` 文件
- 使用 Service Worker（可选）

### 4. 压缩优化
- Cloudflare 自动压缩资源
- 确保源文件已优化

## 🔒 安全配置

### 1. HTTP 头部安全
`_headers` 文件已包含：
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### 2. 内容安全策略（可选）
添加 CSP 头部：
```nginx
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### 3. 访问控制
- 使用 Cloudflare Access（企业版）
- 配置 IP 限制规则

## 📊 监控和分析

### 1. Cloudflare Analytics
- 页面访问统计
- 带宽使用情况
- 错误率监控

### 2. 自定义分析
集成 Google Analytics 或 Plausible：
```html
<!-- 在 index.html 中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 更新和维护

### 日常更新
1. 修改文档内容
2. 提交到 Git 仓库
3. Cloudflare Pages 自动部署

### 重大更新
1. 在本地测试
2. 创建发布分支
3. 部署到预览环境测试
4. 合并到主分支部署

### 回滚部署
在 Cloudflare Dashboard 中：
1. 进入 Pages 项目
2. 选择 "Deployments"
3. 找到要回滚的版本
4. 点击 "..." → "Rollback to this deployment"

## 📞 支持资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Cloudflare Community](https://community.cloudflare.com/)

---

**部署成功！** 🎉

您的笔记应用现在已部署到 Cloudflare Pages，享受全球加速和安全可靠的托管服务。