# Notes - Markdown 文档管理系统

一个基于Web的Markdown文档管理系统，支持文档浏览、搜索和实时预览。

## 功能特性

- **文档管理**：按目录组织Markdown文档，支持多层级分类
- **实时预览**：自动渲染Markdown文档为HTML格式
- **大纲导航**：自动生成文档大纲，方便快速跳转
- **响应式设计**：适配桌面端和移动端设备
- **URL路由**：支持直接通过URL访问特定文档
- **刷新保持**：页面刷新后保持当前文档状态

## 项目结构

```
.
├── app.py                 # Flask后端服务
├── index.html             # 主页面模板
├── styles.css             # 样式文件
├── script.js              # 前端JavaScript逻辑
├── marked.min.js          # Markdown解析库
├── docs/                  # 文档存储目录
│   ├── draft/             # 草稿文档
│   ├── images/            # 图片资源
│   ├── linux/             # Linux相关文档
│   ├── php/               # PHP相关文档
│   ├── python/            # Python相关文档
│   ├── services/          # 服务相关文档
│   └── tool/              # 工具相关文档
└── README.md              # 项目说明文档
```

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Python Flask
- **Markdown解析**：Marked.js
- **样式设计**：Apple-inspired design language

## 安装与运行

### 环境要求

- Python 3.6+
- pip包管理器

### 安装步骤

1. 克隆项目到本地：
   ```bash
   git clone <repository-url>
   cd note
   ```

2. 安装依赖：
   ```bash
   pip install flask gunicorn
   ```

3. 启动服务（开发模式）：
   ```bash
   python app.py
   ```

4. 或者使用Gunicorn启动（生产模式）：
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5001 app:app
   ```

5. 访问应用：
   打开浏览器访问 `http://localhost:5001`

### 使用方法

1. **浏览文档**：在左侧边栏点击目录和文档名称浏览
2. **查看大纲**：右侧边栏显示当前文档的大纲结构
3. **直接访问**：可通过URL直接访问特定文档，例如：
   ```
   http://localhost:5001/docs/linux/vim.md
   ```
4. **刷新保持**：刷新页面后会保持当前查看的文档

## 生产环境部署

### 使用Gunicorn

本应用支持使用Gunicorn进行生产环境部署。项目已包含Gunicorn配置文件`gunicorn.conf.py`，可以使用以下命令启动：

```bash
gunicorn -c gunicorn.conf.py app:app
```

### 使用Nginx作为反向代理

为了获得更好的性能和安全性，建议使用Nginx作为反向代理。项目包含了示例Nginx配置文件`nginx.conf`。

1. 将`nginx.conf`复制到Nginx配置目录中（通常为`/etc/nginx/sites-available/`）
2. 修改配置文件中的`server_name`为你自己的域名
3. 创建软链接启用站点：
   ```bash
   sudo ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/
   ```
4. 测试Nginx配置并重新加载：
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### SSL证书配置（推荐）

对于生产环境，强烈建议启用HTTPS。可以在Nginx配置中取消注释SSL相关部分，并配置你的SSL证书路径。

## 文档组织

文档按照以下结构组织在`docs`目录中：

- 每个子目录代表一个文档分类
- 子目录中的`.md`文件为Markdown文档
- 支持中文文件名和目录名

示例：
```
docs/
├── linux/
│   ├── vim.md
│   └── shell.md
└── python/
    └── Python.md
```

## 开发说明

### 前端架构

- 使用原生JavaScript，无框架依赖
- 采用模块化设计，易于维护和扩展
- 响应式布局，适配不同屏幕尺寸

### 后端API

提供以下RESTful API接口：

1. `GET /api/documents` - 获取所有文档目录结构
2. `GET /api/document/<dir_name>/<file_name>` - 获取特定文档内容

### 路由处理

- `/` - 返回主页面
- `/docs/<path:path>` - 处理文档路径，重定向到主页面由前端处理
- `/<path:path>` - 静态文件服务

## 自定义配置

### 样式定制

可以通过修改`styles.css`文件来自定义界面样式：
- 颜色主题在`:root`部分定义
- 响应式断点可根据需要调整
- 组件样式可按需修改

### 文档目录

默认文档目录为`docs`，可通过修改`app.py`中的`DOCS_PATH`变量来更改。

## 故障排除

### 常见问题

1. **页面无内容显示**
   - 检查JavaScript控制台是否有错误
   - 确认后端服务是否正常运行
   - 验证文档目录结构是否正确

2. **样式未加载**
   - 检查CSS文件路径是否正确
   - 确认服务器能否正确提供静态文件

3. **API访问错误**
   - 检查后端服务日志
   - 验证文档文件是否存在且格式正确

### 调试方法

1. 打开浏览器开发者工具查看控制台输出
2. 检查网络面板确认资源加载状态
3. 查看后端服务日志定位问题

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目。