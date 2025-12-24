/**
 * 笔记应用 - 主脚本文件
 * 功能：动态加载目录结构、渲染 Markdown 文档、生成大纲、处理文件变更
 */

// 应用状态管理
const AppState = {
    currentDirectory: null,
    currentFile: null,
    directoryStructure: null,
    expandedDirectories: new Set(),
    fileCache: new Map(),
    lastUpdateTime: null
};

// 配置常量
const CONFIG = {
    DIRECTORY_STRUCTURE_URL: '/docs/directory-structure.json',
    DOCS_BASE_PATH: '/docs/',
    CACHE_DURATION: 5 * 60 * 1000, // 5分钟缓存
    POLL_INTERVAL: 30 * 1000, // 30秒轮询检查更新
    DEBOUNCE_DELAY: 300, // 防抖延迟
    ROUTE_PREFIX: '#/' // 哈希路由前缀
};

/**
 * 初始化应用
 */
async function initApp() {
    try {
        // 加载目录结构
        await loadDirectoryStructure();

        // 渲染目录导航
        renderDirectoryNavigation();

        // 设置事件监听器
        setupEventListeners();

        // 初始化路由
        initRouter();

        // 启动文件变更监听
        startFileChangeListener();

        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        showError('无法加载应用，请刷新页面重试');
    }
}

/**
 * 加载目录结构
 */
async function loadDirectoryStructure() {
    try {
        const timestamp = new Date().getTime();
        const url = `${CONFIG.DIRECTORY_STRUCTURE_URL}?t=${timestamp}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // 解析新的 JSON 结构
        if (data.directories) {
            AppState.directoryStructure = data.directories;
            AppState.lastUpdateTime = new Date(data.metadata?.generatedAt || Date.now()).getTime();
        } else {
            // 兼容旧结构
            AppState.directoryStructure = data;
            AppState.lastUpdateTime = new Date().getTime();
        }

        // 初始化展开状态
        if (AppState.directoryStructure.length > 0) {
            AppState.expandedDirectories.add(AppState.directoryStructure[0].name);
        }

    } catch (error) {
        console.error('加载目录结构失败:', error);
        throw error;
    }
}

/**
 * 渲染目录导航
 */
function renderDirectoryNavigation() {
    const directoryList = document.getElementById('directory-list');
    if (!directoryList || !AppState.directoryStructure) return;
    
    directoryList.innerHTML = '';
    
    AppState.directoryStructure.forEach(directory => {
        const isExpanded = AppState.expandedDirectories.has(directory.name);
        
        // 创建目录项
        const directoryItem = document.createElement('li');
        directoryItem.className = 'directory-item';
        
        // 目录头部
        const directoryHeader = document.createElement('div');
        directoryHeader.className = 'directory-header';
        directoryHeader.dataset.directory = directory.name;
        
        directoryHeader.innerHTML = `
            <span class="directory-name">${escapeHtml(directory.name)}</span>
            <span class="toggle-icon ${isExpanded ? 'rotated' : ''}">▶</span>
        `;
        
        // 文件列表
        const fileList = document.createElement('ul');
        fileList.className = `file-list ${isExpanded ? 'expanded' : ''}`;
        
        directory.files.forEach(file => {
            const fileItem = document.createElement('li');
            fileItem.className = 'file-item';
            fileItem.dataset.directory = directory.name;
            fileItem.dataset.file = file;
            fileItem.textContent = file.replace('.md', '');
            
            fileList.appendChild(fileItem);
        });
        
        directoryItem.appendChild(directoryHeader);
        directoryItem.appendChild(fileList);
        directoryList.appendChild(directoryItem);
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 目录切换事件
    document.addEventListener('click', (e) => {
        const directoryHeader = e.target.closest('.directory-header');
        if (directoryHeader) {
            e.preventDefault();
            const directoryName = directoryHeader.dataset.directory;
            toggleDirectory(directoryName);
            return;
        }
        
        // 文件点击事件
        const fileItem = e.target.closest('.file-item');
        if (fileItem) {
            e.preventDefault();
            const directoryName = fileItem.dataset.directory;
            const fileName = fileItem.dataset.file;
            loadDocumentWithRouting(directoryName, fileName);
            return;
        }
        
        // 大纲链接点击事件
        const outlineLink = e.target.closest('.outline-link');
        if (outlineLink) {
            e.preventDefault();
            const targetId = outlineLink.getAttribute('href');
            if (targetId) {
                scrollToHeading(targetId);
            }
        }
    });
    
    // 窗口大小变化时重新计算布局
    window.addEventListener('resize', debounce(handleResize, CONFIG.DEBOUNDE_DELAY));
    
    // 键盘导航支持
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * 切换目录展开/折叠状态
 */
function toggleDirectory(directoryName) {
    if (AppState.expandedDirectories.has(directoryName)) {
        AppState.expandedDirectories.delete(directoryName);
    } else {
        AppState.expandedDirectories.add(directoryName);
    }
    
    renderDirectoryNavigation();
}

/**
 * 加载文档
 */
async function loadDocument(directoryName, fileName) {
    try {
        // 更新活动状态
        updateActiveStates(directoryName, fileName);
        
        // 检查缓存
        const cacheKey = `${directoryName}/${fileName}`;
        let content = AppState.fileCache.get(cacheKey);
        
        if (!content) {
            // 从服务器加载
            const filePath = `${CONFIG.DOCS_BASE_PATH}${directoryName}/${fileName}`;
            const timestamp = new Date().getTime();
            const url = `${filePath}?t=${timestamp}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            content = await response.text();
            AppState.fileCache.set(cacheKey, content);
        }
        
        // 渲染文档
        renderDocument(fileName, content);
        
        // 更新应用状态
        AppState.currentDirectory = directoryName;
        AppState.currentFile = fileName;
        
    } catch (error) {
        console.error('加载文档失败:', error);
        showError(`无法加载文档: ${fileName}`);
    }
}

/**
 * 更新活动状态
 */
function updateActiveStates(directoryName, fileName) {
    // 移除所有活动状态
    document.querySelectorAll('.directory-header.active').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.file-item.active').forEach(el => {
        el.classList.remove('active');
    });
    
    // 设置新的活动状态
    const directoryHeader = document.querySelector(`.directory-header[data-directory="${directoryName}"]`);
    if (directoryHeader) {
        directoryHeader.classList.add('active');
    }
    
    const fileItem = document.querySelector(`.file-item[data-directory="${directoryName}"][data-file="${fileName}"]`);
    if (fileItem) {
        fileItem.classList.add('active');
    }
}

/**
 * 渲染文档
 */
function renderDocument(fileName, content) {
    // 更新路径
    updateDocumentPath();

    // 更新标题
    const titleElement = document.getElementById('document-title');
    if (titleElement) {
        const title = fileName.replace('.md', '').replace(/_/g, ' ');
        titleElement.textContent = title;
    }

    // 渲染 Markdown
    const bodyElement = document.getElementById('document-body');
    if (bodyElement && window.marked) {
        const html = window.marked.parse(content);
        bodyElement.innerHTML = html;

        // 生成大纲
        generateOutline();

        // 添加代码高亮
        highlightCodeBlocks();

        // 处理内部链接
        processInternalLinks();
    }
}

/**
 * 更新文档路径显示
 */
function updateDocumentPath() {
    const pathElement = document.getElementById('document-path');
    if (!pathElement || !AppState.currentDirectory || !AppState.currentFile) return;

    const directoryName = AppState.currentDirectory;
    const fileName = AppState.currentFile.replace('.md', '');

    // 创建面包屑导航
    const pathHtml = `
        <a href="#" class="path-link">首页</a>
        <span class="path-separator">/</span>
        <a href="${CONFIG.ROUTE_PREFIX}${encodeURIComponent(directoryName)}" class="path-link">${escapeHtml(directoryName)}</a>
        <span class="path-separator">/</span>
        <span class="path-current">${escapeHtml(fileName)}</span>
    `;

    pathElement.innerHTML = pathHtml;

    // 为目录链接添加点击事件
    const directoryLink = pathElement.querySelector(`a[href="${CONFIG.ROUTE_PREFIX}${encodeURIComponent(directoryName)}"]`);
    if (directoryLink) {
        directoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            // 加载该目录的第一个文件
            const dir = AppState.directoryStructure.find(d => d.name === directoryName);
            if (dir && dir.files.length > 0) {
                loadDocumentWithRouting(directoryName, dir.files[0]);
            }
        });
    }

    // 为首页链接添加点击事件
    const homeLink = pathElement.querySelector('a[href="#"]');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadDefaultDocument();
            // 清除哈希
            window.location.hash = '';
        });
    }
}

/**
 * 生成大纲
 */
function generateOutline() {
    const outlineContent = document.getElementById('outline-content');
    if (!outlineContent) return;
    
    const headings = document.querySelectorAll('.document-body h1, .document-body h2, .document-body h3, .document-body h4, .document-body h5, .document-body h6');
    
    if (headings.length === 0) {
        outlineContent.innerHTML = '<p class="no-outline">暂无大纲</p>';
        return;
    }
    
    const outlineList = document.createElement('ul');
    outlineList.className = 'outline-list';
    
    headings.forEach((heading, index) => {
        // 跳过第一个 h1（通常是标题）
        if (index === 0 && heading.tagName === 'H1') return;
        
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent;
        const id = heading.id || `heading-${index}`;
        
        // 确保标题有 ID
        if (!heading.id) {
            heading.id = id;
        }
        
        const outlineItem = document.createElement('li');
        outlineItem.className = 'outline-item';
        
        const outlineLink = document.createElement('a');
        outlineLink.href = `#${id}`;
        outlineLink.className = `outline-link level-${level}`;
        outlineLink.textContent = text;
        
        outlineItem.appendChild(outlineLink);
        outlineList.appendChild(outlineItem);
    });
    
    outlineContent.innerHTML = '';
    outlineContent.appendChild(outlineList);
}

/**
 * 滚动到标题
 */
function scrollToHeading(headingId) {
    const heading = document.getElementById(headingId.substring(1));
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * 高亮代码块
 */
function highlightCodeBlocks() {
    // 这里可以集成 Prism.js 或其他高亮库
    // 暂时使用简单的样式增强
    document.querySelectorAll('pre code').forEach(block => {
        block.classList.add('hljs');
    });
}

/**
 * 处理内部链接
 */
function processInternalLinks() {
    document.querySelectorAll('.document-body a[href$=".md"]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');

            // 解析链接路径
            const pathParts = href.split('/');
            const fileName = pathParts.pop();
            const directoryName = pathParts.pop() || AppState.currentDirectory;

            if (fileName && directoryName) {
                await loadDocumentWithRouting(directoryName, fileName);
            }
        });

        // 更新链接为路由格式
        const href = link.getAttribute('href');
        if (href && href.endsWith('.md')) {
            const pathParts = href.split('/');
            const fileName = pathParts.pop();
            const directoryName = pathParts.pop() || AppState.currentDirectory;

            if (fileName && directoryName) {
                const fileNameWithoutExt = fileName.replace('.md', '');
                const newHref = `${CONFIG.ROUTE_PREFIX}${encodeURIComponent(directoryName)}/${encodeURIComponent(fileNameWithoutExt)}`;
                link.setAttribute('href', newHref);
            }
        }
    });
}

/**
 * 加载默认文档
 */
async function loadDefaultDocument() {
    if (!AppState.directoryStructure || AppState.directoryStructure.length === 0) {
        return;
    }
    
    const firstDirectory = AppState.directoryStructure[0];
    if (firstDirectory.files && firstDirectory.files.length > 0) {
        await loadDocument(firstDirectory.name, firstDirectory.files[0]);
    }
}

/**
 * 启动文件变更监听
 */
function startFileChangeListener() {
    // 定期检查目录结构更新
    setInterval(async () => {
        try {
            await checkForUpdates();
        } catch (error) {
            console.warn('检查更新失败:', error);
        }
    }, CONFIG.POLL_INTERVAL);
}

/**
 * 检查更新
 */
async function checkForUpdates() {
    try {
        const timestamp = new Date().getTime();
        const url = `${CONFIG.DIRECTORY_STRUCTURE_URL}?t=${timestamp}`;

        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        let generatedAt;

        // 解析新的 JSON 结构
        if (data.metadata && data.metadata.generatedAt) {
            generatedAt = new Date(data.metadata.generatedAt).getTime();
        } else {
            // 如果没有时间戳，使用当前时间
            generatedAt = new Date().getTime();
        }

        if (!AppState.lastUpdateTime || generatedAt > AppState.lastUpdateTime) {
            console.log('检测到目录结构更新，重新加载...');
            await loadDirectoryStructure();
            renderDirectoryNavigation();

            // 如果当前文档所属目录已删除，加载默认文档
            if (AppState.currentDirectory && AppState.currentFile) {
                const dirExists = AppState.directoryStructure.some(dir => dir.name === AppState.currentDirectory);
                if (!dirExists) {
                    await loadDefaultDocument();
                }
            }
        }
    } catch (error) {
        console.warn('检查更新时出错:', error);
    }
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
    // 可以根据窗口大小调整布局
    const outlinePanel = document.querySelector('.outline-panel');
    if (outlinePanel) {
        if (window.innerWidth < 992) {
            outlinePanel.style.display = 'none';
        } else {
            outlinePanel.style.display = 'block';
        }
    }
}

/**
 * 处理键盘导航
 */
function handleKeyboardNavigation(e) {
    // 支持键盘快捷键
    switch (e.key) {
        case 'Escape':
            // 清除搜索或关闭模态框
            break;
        case '/':
            // 聚焦搜索框
            e.preventDefault();
            // 如果有搜索功能，可以在这里实现
            break;
        case 'j':
        case 'k':
            // 上下导航（vim风格）
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                navigateFiles(e.key === 'j' ? 'down' : 'up');
            }
            break;
    }
}

/**
 * 文件导航
 */
function navigateFiles(direction) {
    if (!AppState.currentDirectory || !AppState.currentFile) return;
    
    const currentDir = AppState.directoryStructure.find(dir => dir.name === AppState.currentDirectory);
    if (!currentDir) return;
    
    const currentIndex = currentDir.files.indexOf(AppState.currentFile);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'down') {
        newIndex = Math.min(currentIndex + 1, currentDir.files.length - 1);
    } else {
        newIndex = Math.max(currentIndex - 1, 0);
    }
    
    if (newIndex !== currentIndex) {
        loadDocumentWithRouting(AppState.currentDirectory, currentDir.files[newIndex]);
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff3b30;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 等待 marked.js 加载
 */
function waitForMarked() {
    return new Promise((resolve) => {
        if (window.marked) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 50; // 5秒超时
        
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.marked) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn('marked.js 加载超时');
                resolve();
            }
        }, 100);
    });
}

/**
 * 初始化路由
 */
function initRouter() {
    // 监听 hashchange 事件（哈希路由变化）
    window.addEventListener('hashchange', handleHashChange);

    // 解析当前哈希
    const { directory, file } = parseCurrentHash();

    if (directory && file) {
        // 从哈希加载文档
        loadDocument(directory, file);
    } else {
        // 加载默认文档
        loadDefaultDocument();
    }
}

/**
 * 处理哈希变化
 */
function handleHashChange() {
    const { directory, file } = parseCurrentHash();

    if (directory && file) {
        loadDocument(directory, file);
    } else {
        loadDefaultDocument();
    }
}

/**
 * 解析当前哈希
 * 返回 { directory, file } 或 null
 */
function parseCurrentHash() {
    const hash = window.location.hash;

    // 检查是否匹配 #/<directory>/<file> 格式
    const routeRegex = new RegExp(`^${CONFIG.ROUTE_PREFIX}([^/]+)/([^/]+)$`);
    const match = hash.match(routeRegex);

    if (match) {
        const directory = decodeURIComponent(match[1]);
        const file = decodeURIComponent(match[2]);

        // 确保文件以 .md 结尾
        const fileName = file.endsWith('.md') ? file : `${file}.md`;

        return { directory, file: fileName };
    }

    return { directory: null, file: null };
}

/**
 * 更新 URL
 */
function updateUrl(directory, file) {
    if (!directory || !file) return;

    // 移除 .md 扩展名用于美观的 URL
    const fileNameWithoutExt = file.replace('.md', '');
    const hash = `${CONFIG.ROUTE_PREFIX}${encodeURIComponent(directory)}/${encodeURIComponent(fileNameWithoutExt)}`;

    // 更新浏览器哈希
    window.location.hash = hash;

    // 更新页面标题
    const title = `${fileNameWithoutExt} - Notes`;
    document.title = title;
}

/**
 * 加载文档（带路由支持）
 */
async function loadDocumentWithRouting(directoryName, fileName) {
    try {
        // 更新 URL
        updateUrl(directoryName, fileName);

        // 更新活动状态
        updateActiveStates(directoryName, fileName);

        // 检查缓存
        const cacheKey = `${directoryName}/${fileName}`;
        let content = AppState.fileCache.get(cacheKey);

        if (!content) {
            // 从服务器加载
            const filePath = `${CONFIG.DOCS_BASE_PATH}${directoryName}/${fileName}`;
            const timestamp = new Date().getTime();
            const url = `${filePath}?t=${timestamp}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            content = await response.text();
            AppState.fileCache.set(cacheKey, content);
        }

        // 渲染文档
        renderDocument(fileName, content);

        // 更新应用状态
        AppState.currentDirectory = directoryName;
        AppState.currentFile = fileName;

    } catch (error) {
        console.error('加载文档失败:', error);
        showError(`无法加载文档: ${fileName}`);

        // 如果文档加载失败，回退到默认文档
        await loadDefaultDocument();
    }
}

/**
 * 加载默认文档
 */
async function loadDefaultDocument() {
    if (!AppState.directoryStructure || AppState.directoryStructure.length === 0) {
        return;
    }

    const firstDirectory = AppState.directoryStructure[0];
    if (firstDirectory.files && firstDirectory.files.length > 0) {
        await loadDocumentWithRouting(firstDirectory.name, firstDirectory.files[0]);
    } else {
        // 如果没有文档，清空路径显示
        const pathElement = document.getElementById('document-path');
        if (pathElement) {
            pathElement.innerHTML = '';
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    // 等待 marked.js 加载
    await waitForMarked();

    // 初始化应用
    await initApp();
});

// 导出函数供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        loadDirectoryStructure,
        loadDocument: loadDocumentWithRouting,
        toggleDirectory,
        generateOutline,
        parseCurrentUrl,
        updateUrl
    };
}