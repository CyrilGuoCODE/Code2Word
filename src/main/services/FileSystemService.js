/**
 * 文件系统服务
 * 处理文件扫描、读取和过滤操作
 */

const fs = require('fs-extra');
const path = require('path');
const ignore = require('ignore');
const mime = require('mime-types');

class FileSystemService {
  constructor() {
    this.supportedExtensions = new Set([
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.c', '.cpp', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs',
      '.ml', '.fs', '.vb', '.pl', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat',
      '.cmd', '.html', '.htm', '.css', '.scss', '.sass', '.less', '.xml', '.json',
      '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.md', '.txt', '.sql',
      '.r', '.m', '.mm', '.dart', '.lua', '.vim', '.el', '.lisp', '.scm', '.rkt'
    ]);
  }

  /**
   * 扫描目录并返回应用排除规则的文件树
   */
  async scanDirectory(directoryPath, exclusionRules = {}) {
    try {
      const stats = await fs.stat(directoryPath);
      if (!stats.isDirectory()) {
        throw new Error('路径不是目录');
      }

      const ignoreFilter = await this.createIgnoreFilter(directoryPath, exclusionRules);
      const fileTree = await this.buildFileTree(directoryPath, ignoreFilter, exclusionRules);
      
      return fileTree;
    } catch (error) {
      throw new Error(`扫描目录失败: ${error.message}`);
    }
  }

  /**
   * 读取文件内容并检测编码
   */
  async readFileContent(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      // 检查文件是否过大 (>10MB)
      if (stats.size > 10 * 1024 * 1024) {
        return {
          content: '[文件过大无法显示]',
          truncated: true,
          size: stats.size
        };
      }

      // 检查是否为二进制文件
      if (this.isBinaryFile(filePath)) {
        return {
          content: '[二进制文件]',
          binary: true,
          size: stats.size
        };
      }

      const content = await fs.readFile(filePath, 'utf8');
      return {
        content,
        size: stats.size,
        encoding: 'utf8'
      };
    } catch (error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
  }  
/**
   * 获取文件统计信息
   */
  async getFileStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    } catch (error) {
      throw new Error(`获取文件统计信息失败: ${error.message}`);
    }
  }

  /**
   * 从 .gitignore 和自定义规则创建忽略过滤器
   */
  async createIgnoreFilter(directoryPath, exclusionRules) {
    const ig = ignore();

    // 添加默认忽略规则
    ig.add([
      '.git/',
      'node_modules/',
      '.DS_Store',
      'Thumbs.db',
      '*.log'
    ]);

    // 如果启用了 .gitignore，则加载 .gitignore 文件
    if (exclusionRules.useGitignore !== false) {
      await this.loadGitignoreFiles(directoryPath, ig);
    }

    // 添加自定义排除规则
    if (exclusionRules.customExclusions && exclusionRules.customExclusions.length > 0) {
      ig.add(exclusionRules.customExclusions);
    }

    return ig;
  }

  /**
   * 递归加载目录和父目录中的 .gitignore 文件
   */
  async loadGitignoreFiles(directoryPath, ig) {
    const gitignorePath = path.join(directoryPath, '.gitignore');
    
    try {
      if (await fs.pathExists(gitignorePath)) {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        
        // 更精确地解析 gitignore 内容
        const lines = this.parseGitignoreContent(gitignoreContent);
        
        if (lines.length > 0) {
          console.log('加载 .gitignore 规则:', lines);
          ig.add(lines);
        }
      }
    } catch (error) {
      console.warn(`读取 .gitignore 文件失败 ${gitignorePath}:`, error.message);
    }

    // 检查全局 .gitignore
    try {
      const globalGitignore = path.join(require('os').homedir(), '.gitignore_global');
      if (await fs.pathExists(globalGitignore)) {
        const globalContent = await fs.readFile(globalGitignore, 'utf8');
        const lines = this.parseGitignoreContent(globalContent);
        
        if (lines.length > 0) {
          ig.add(lines);
        }
      }
    } catch (error) {
      // 全局 gitignore 是可选的
    }
  }

  /**
   * 解析 .gitignore 文件内容
   */
  parseGitignoreContent(content) {
    return content
      .split(/\r?\n/) // 支持不同的换行符
      .map(line => {
        // 移除行尾空格但保留行首空格（可能有意义）
        line = line.replace(/\s+$/, '');
        return line;
      })
      .filter(line => {
        // 过滤空行和注释行
        return line && !line.startsWith('#');
      })
      .map(line => {
        // 处理特殊字符转义
        return line;
      });
  }

  /**
   * 递归构建文件树
   */
  async buildFileTree(dirPath, ignoreFilter, exclusionRules, relativePath = '') {
    const items = await fs.readdir(dirPath);
    const fileNodes = [];

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
      
      // 检查项目是否应该被排除
      const exclusionResult = this.shouldExclude(itemRelativePath, ignoreFilter, exclusionRules, fullPath);
      
      const stats = await fs.stat(fullPath);
      const node = {
        path: fullPath,
        relativePath: itemRelativePath,
        name: item,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime,
        excluded: exclusionResult.excluded,
        exclusionReason: exclusionResult.reason
      };

      if (stats.isFile()) {
        node.extension = path.extname(item);
        node.isSupported = this.supportedExtensions.has(node.extension);
        node.isBinary = this.isBinaryFile(fullPath);
      }

      if (stats.isDirectory() && !exclusionResult.excluded) {
        node.children = await this.buildFileTree(fullPath, ignoreFilter, exclusionRules, itemRelativePath);
      }

      fileNodes.push(node);
    }

    return fileNodes;
  }  
/**
   * 检查文件/目录是否应该被排除
   */
  shouldExclude(relativePath, ignoreFilter, exclusionRules, fullPath = null) {
    // 标准化路径以确保一致的检查
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    // 首先检查自定义包含规则（最高优先级）
    if (exclusionRules.customInclusions && exclusionRules.customInclusions.length > 0) {
      const includeFilter = ignore().add(exclusionRules.customInclusions);
      if (!includeFilter.ignores(normalizedPath)) {
        return { excluded: false, reason: '自定义包含规则' };
      }
    }

    // 使用原始路径和标准化路径检查忽略过滤器
    if (ignoreFilter.ignores(normalizedPath) || ignoreFilter.ignores(relativePath)) {
      return { excluded: true, reason: 'Gitignore 或自定义排除规则' };
    }

    // 检查文件大小排除
    if (exclusionRules.excludeBySize && exclusionRules.maxFileSize && fullPath) {
      try {
        const stats = fs.statSync(fullPath);
        if (stats.size > exclusionRules.maxFileSize) {
          return { 
            excluded: true, 
            reason: `文件大小超过 ${this.formatFileSize(exclusionRules.maxFileSize)}` 
          };
        }
      } catch (error) {
        // 文件不存在或无法访问
      }
    }

    // 检查二进制文件排除
    if (exclusionRules.excludeBinaryFiles && fullPath && this.isBinaryFile(fullPath)) {
      return { excluded: true, reason: '二进制文件排除' };
    }

    return { excluded: false, reason: null };
  }

  /**
   * 格式化文件大小显示
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * 检查文件是否为二进制文件
   */
  isBinaryFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    // 已知的二进制扩展名
    const binaryExtensions = new Set([
      '.exe', '.dll', '.so', '.dylib', '.bin', '.dat', '.db', '.sqlite', '.sqlite3',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg', '.webp', '.tiff',
      '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.ogg', '.wav',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar',
      '.7z', '.tar', '.gz', '.bz2', '.xz', '.dmg', '.iso', '.img', '.deb', '.rpm'
    ]);

    if (binaryExtensions.has(ext)) {
      return true;
    }

    // 检查 MIME 类型
    const mimeType = mime.lookup(filePath);
    if (mimeType && !mimeType.startsWith('text/') && !mimeType.includes('json') && !mimeType.includes('xml')) {
      return true;
    }

    return false;
  }
}

module.exports = FileSystemService;