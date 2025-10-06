/**
 * Code2Word Converter - Main Process
 * Electron main process entry point
 */

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

// Import services
const FileSystemService = require('./services/FileSystemService');
const ConfigurationService = require('./services/ConfigurationService');
const DocumentGenerator = require('./services/DocumentGenerator');

class Code2WordApp {
  constructor() {
    this.mainWindow = null;
    this.services = {
      fileSystem: new FileSystemService(),
      configuration: new ConfigurationService(),
      documentGenerator: new DocumentGenerator()
    };
    
    this.setupApp();
    this.setupIPC();
  }

  setupApp() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.createMenu();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Handle app window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app before quit
    app.on('before-quit', () => {
      // Cleanup services
      this.cleanup();
    });
  }

  createMainWindow() {
    const preloadPath = path.join(__dirname, '../preload/preload.js');
    console.log('Preload script path:', preloadPath);
    
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: preloadPath,
        sandbox: false
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
      show: false
    });

    // Load the renderer
    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      if (isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  createMenu() {
    const template = [
      {
        label: '文件',
        submenu: [
          {
            label: '打开项目...',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.handleOpenProject()
          },
          {
            label: '保存配置...',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.handleSaveConfig()
          },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          { label: '撤销', role: 'undo' },
          { label: '重做', role: 'redo' },
          { type: 'separator' },
          { label: '剪切', role: 'cut' },
          { label: '复制', role: 'copy' },
          { label: '粘贴', role: 'paste' }
        ]
      },
      {
        label: '查看',
        submenu: [
          { label: '重新加载', role: 'reload' },
          { label: '强制重新加载', role: 'forceReload' },
          { label: '切换开发者工具', role: 'toggleDevTools' },
          { type: 'separator' },
          { label: '重置缩放', role: 'resetZoom' },
          { label: '放大', role: 'zoomIn' },
          { label: '缩小', role: 'zoomOut' },
          { type: 'separator' },
          { label: '切换全屏', role: 'togglefullscreen' }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '关于 Code2Word',
            click: () => this.showAbout()
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // File system operations
    ipcMain.handle('fs:selectDirectory', this.handleSelectDirectory.bind(this));
    ipcMain.handle('fs:scanDirectory', this.handleScanDirectory.bind(this));
    ipcMain.handle('fs:readFile', this.handleReadFile.bind(this));

    // Configuration operations
    ipcMain.handle('config:load', this.handleLoadConfig.bind(this));
    ipcMain.handle('config:save', this.handleSaveConfig.bind(this));
    ipcMain.handle('config:getDefault', this.handleGetDefaultConfig.bind(this));

    // Document generation
    ipcMain.handle('doc:generate', this.handleGenerateDocument.bind(this));
    ipcMain.handle('doc:preview', this.handlePreviewDocument.bind(this));
    ipcMain.handle('doc:estimateSize', this.handleEstimateSize.bind(this));

    // Application operations
    ipcMain.handle('app:getVersion', () => app.getVersion());
    ipcMain.handle('app:showMessageBox', this.handleShowMessageBox.bind(this));
  }

  // IPC Handlers
  async handleSelectDirectory() {
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory'],
      title: '选择项目目录'
    });

    return result.canceled ? null : result.filePaths[0];
  }

  async handleScanDirectory(event, directoryPath, rules) {
    try {
      return await this.services.fileSystem.scanDirectory(directoryPath, rules);
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw error;
    }
  }

  async handleReadFile(event, filePath) {
    try {
      return await this.services.fileSystem.readFileContent(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async handleLoadConfig(event, configPath) {
    try {
      return await this.services.configuration.loadConfig(configPath);
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }

  async handleSaveConfig(event, config, configPath) {
    try {
      return await this.services.configuration.saveConfig(config, configPath);
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  handleGetDefaultConfig() {
    return this.services.configuration.getDefaultConfig();
  }

  async handleGenerateDocument(event, files, config) {
    try {
      return await this.services.documentGenerator.generateDocument(files, config);
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }

  async handlePreviewDocument(event, files, config) {
    try {
      return await this.services.documentGenerator.generatePreview(files, config);
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  }

  async handleEstimateSize(event, files) {
    try {
      return await this.services.documentGenerator.estimateSize(files);
    } catch (error) {
      console.error('Error estimating size:', error);
      throw error;
    }
  }

  async handleShowMessageBox(event, options) {
    return await dialog.showMessageBox(this.mainWindow, options);
  }

  async handleOpenProject() {
    const directory = await this.handleSelectDirectory();
    if (directory) {
      this.mainWindow.webContents.send('project:opened', directory);
    }
  }

  showAbout() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '关于 Code2Word',
      message: 'Code2Word 转换器',
      detail: `版本: ${app.getVersion()}\n\n将代码项目转换为 Word 文档，具有智能文件过滤和格式化功能。`
    });
  }

  cleanup() {
    // Cleanup services if needed
    console.log('Cleaning up application...');
  }
}

// Create and start the application
new Code2WordApp();