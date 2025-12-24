#!/usr/bin/env node

/**
 * 目录结构生成脚本
 * 用于扫描 docs 目录并生成 directory-structure.json
 * 可以在构建时或文件变更时运行
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    DOCS_DIR: path.join(__dirname, 'docs'),
    OUTPUT_FILE: path.join(__dirname, 'public', 'docs', 'directory-structure.json'),
    IGNORE_DIRS: ['.git', 'node_modules', '__pycache__', 'images'],
    IGNORE_FILES: ['.DS_Store', 'directory-structure.json']
};

/**
 * 主函数
 */
async function main() {
    console.log('开始生成目录结构...');
    
    try {
        // 检查 docs 目录是否存在
        if (!fs.existsSync(CONFIG.DOCS_DIR)) {
            console.error(`错误: docs 目录不存在: ${CONFIG.DOCS_DIR}`);
            process.exit(1);
        }
        
        // 扫描目录结构
        const directoryStructure = await scanDirectory(CONFIG.DOCS_DIR);
        
        // 写入输出文件
        await writeOutputFile(directoryStructure);
        
        console.log(`目录结构生成完成: ${CONFIG.OUTPUT_FILE}`);
        console.log(`共扫描到 ${directoryStructure.length} 个目录`);
        
    } catch (error) {
        console.error('生成目录结构时出错:', error);
        process.exit(1);
    }
}

/**
 * 扫描目录
 */
async function scanDirectory(rootDir) {
    const items = fs.readdirSync(rootDir, { withFileTypes: true });
    const result = [];
    
    for (const item of items) {
        // 跳过忽略的目录和文件
        if (CONFIG.IGNORE_DIRS.includes(item.name) || CONFIG.IGNORE_FILES.includes(item.name)) {
            continue;
        }
        
        if (item.isDirectory()) {
            const dirPath = path.join(rootDir, item.name);
            const files = await scanMarkdownFiles(dirPath);
            
            if (files.length > 0) {
                result.push({
                    name: item.name,
                    files: files.sort() // 按文件名排序
                });
            }
        }
    }
    
    // 按目录名排序
    return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 扫描 Markdown 文件
 */
async function scanMarkdownFiles(dirPath) {
    const files = [];
    
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            if (item.isFile() && item.name.endsWith('.md')) {
                files.push(item.name);
            }
        }
    } catch (error) {
        console.warn(`无法扫描目录 ${dirPath}:`, error.message);
    }
    
    return files;
}

/**
 * 写入输出文件
 */
async function writeOutputFile(directoryStructure) {
    // 添加元数据到 JSON 对象中
    const outputData = {
        metadata: {
            generatedAt: new Date().toISOString(),
            note: "自动生成，下次构建或文件变更时会重新生成"
        },
        directories: directoryStructure
    };

    const jsonContent = JSON.stringify(outputData, null, 2);

    // 确保输出目录存在
    const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(CONFIG.OUTPUT_FILE, jsonContent, 'utf8');
}

/**
 * 监听文件变更
 */
function watchForChanges() {
    console.log('开始监听 docs 目录变更...');
    
    fs.watch(CONFIG.DOCS_DIR, { recursive: true }, async (eventType, filename) => {
        if (!filename) return;
        
        // 忽略非 Markdown 文件和忽略的文件
        if (!filename.endsWith('.md') || CONFIG.IGNORE_FILES.includes(path.basename(filename))) {
            return;
        }
        
        console.log(`检测到文件变更: ${eventType} ${filename}`);
        
        // 防抖：等待 1 秒后重新生成
        clearTimeout(watchForChanges.debounceTimer);
        watchForChanges.debounceTimer = setTimeout(async () => {
            try {
                const directoryStructure = await scanDirectory(CONFIG.DOCS_DIR);
                await writeOutputFile(directoryStructure);
                console.log('目录结构已更新');
            } catch (error) {
                console.error('更新目录结构时出错:', error);
            }
        }, 1000);
    });
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

if (command === 'watch') {
    // 监听模式
    main().then(() => {
        watchForChanges();
        console.log('按 Ctrl+C 退出监听模式');
    });
} else {
    // 单次生成模式
    main();
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
    process.exit(1);
});