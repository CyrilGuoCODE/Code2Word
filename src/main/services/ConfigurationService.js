/**
 * Configuration Service
 * Handles application configuration loading, saving, and validation
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ConfigurationService {
  constructor() {
    this.configDir = path.join(os.homedir(), '.code2word');
    this.defaultConfigPath = path.join(this.configDir, 'config.json');
  }

  /**
   * Load configuration from file
   */
  async loadConfig(configPath = null) {
    const filePath = configPath || this.defaultConfigPath;
    
    try {
      await fs.ensureDir(this.configDir);
      
      if (await fs.pathExists(filePath)) {
        const configData = await fs.readJson(filePath);
        return this.validateAndMergeConfig(configData);
      } else {
        // Return default config if file doesn't exist
        return this.getDefaultConfig();
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error.message);
      return this.getDefaultConfig();
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig(config, configPath = null) {
    const filePath = configPath || this.defaultConfigPath;
    
    try {
      await fs.ensureDir(this.configDir);
      
      // Validate config before saving
      const validatedConfig = this.validateAndMergeConfig(config);
      
      await fs.writeJson(filePath, validatedConfig, { spaces: 2 });
      return { success: true, path: filePath };
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      version: '1.0.0',
      projectPath: '',
      outputPath: path.join(os.homedir(), 'Documents'),
      exclusionRules: {
        useGitignore: true,
        customExclusions: [
          'node_modules/',
          '.git/',
          'dist/',
          'build/',
          '*.log',
          '.DS_Store',
          'Thumbs.db'
        ],
        customInclusions: [],
        excludeBySize: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        excludeBinaryFiles: true
      },
      documentSettings: {
        title: '代码项目文档',
        author: 'Code2Word 转换器',
        header: {
          enabled: true,
          leftText: '{projectName}',
          centerText: '',
          rightText: '{generationDate}',
          variables: {
            projectName: true,
            generationDate: true,
            pageNumber: false,
            totalPages: false,
            fileName: false
          }
        },
        footer: {
          enabled: true,
          leftText: '',
          centerText: '第 {pageNumber} 页，共 {totalPages} 页',
          rightText: '',
          variables: {
            projectName: false,
            generationDate: false,
            pageNumber: true,
            totalPages: true,
            fileName: false
          }
        },
        formatting: {
          fontFamily: '微软雅黑',
          fontSize: 11,
          codeFont: 'Consolas',
          codeFontSize: 9,
          syntaxHighlighting: true,
          lineNumbers: false,
          pageBreakBetweenFiles: true
        },
        tableOfContents: {
          enabled: true,
          depth: 3,
          includePageNumbers: true
        }
      },
      uiSettings: {
        theme: 'light',
        language: 'zh-CN',
        rememberWindowSize: true,
        showHiddenFiles: false,
        autoSave: true
      }
    };
  }  /**

   * Validate and merge configuration with defaults
   */
  validateAndMergeConfig(config) {
    const defaultConfig = this.getDefaultConfig();
    
    // Deep merge with defaults
    const mergedConfig = this.deepMerge(defaultConfig, config);
    
    // Validate specific fields
    this.validateConfig(mergedConfig);
    
    return mergedConfig;
  }

  /**
   * Validate configuration object
   */
  validateConfig(config) {
    const errors = [];

    // Validate version
    if (!config.version || typeof config.version !== 'string') {
      errors.push('Invalid version');
    }

    // Validate paths
    if (config.outputPath && !path.isAbsolute(config.outputPath)) {
      errors.push('Output path must be absolute');
    }

    // Validate exclusion rules
    if (config.exclusionRules) {
      if (config.exclusionRules.maxFileSize && 
          (typeof config.exclusionRules.maxFileSize !== 'number' || 
           config.exclusionRules.maxFileSize <= 0)) {
        errors.push('Max file size must be a positive number');
      }
    }

    // Validate document settings
    if (config.documentSettings && config.documentSettings.formatting) {
      const formatting = config.documentSettings.formatting;
      if (formatting.fontSize && (formatting.fontSize < 6 || formatting.fontSize > 72)) {
        errors.push('Font size must be between 6 and 72');
      }
      if (formatting.codeFontSize && (formatting.codeFontSize < 6 || formatting.codeFontSize > 72)) {
        errors.push('Code font size must be between 6 and 72');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Export configuration for command line use
   */
  exportForCLI(config) {
    return {
      projectPath: config.projectPath,
      outputPath: config.outputPath,
      title: config.documentSettings.title,
      author: config.documentSettings.author,
      excludePatterns: config.exclusionRules.customExclusions,
      includePatterns: config.exclusionRules.customInclusions,
      useGitignore: config.exclusionRules.useGitignore,
      maxFileSize: config.exclusionRules.maxFileSize,
      excludeBinary: config.exclusionRules.excludeBinaryFiles
    };
  }
}

module.exports = ConfigurationService;