/**
 * Code2Word Converter - Preload Script
 * Secure bridge between main and renderer processes
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  selectDirectory: () => ipcRenderer.invoke('fs:selectDirectory'),
  scanDirectory: (directoryPath, rules) => ipcRenderer.invoke('fs:scanDirectory', directoryPath, rules),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),

  // Configuration operations
  loadConfig: (configPath) => ipcRenderer.invoke('config:load', configPath),
  saveConfig: (config, configPath) => ipcRenderer.invoke('config:save', config, configPath),
  getDefaultConfig: () => ipcRenderer.invoke('config:getDefault'),

  // Document generation
  generateDocument: (files, config) => ipcRenderer.invoke('doc:generate', files, config),
  previewDocument: (files, config) => ipcRenderer.invoke('doc:preview', files, config),
  estimateSize: (files) => ipcRenderer.invoke('doc:estimateSize', files),

  // Application operations
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  showMessageBox: (options) => ipcRenderer.invoke('app:showMessageBox', options),

  // Event listeners
  onProjectOpened: (callback) => ipcRenderer.on('project:opened', callback),
  onProgressUpdate: (callback) => ipcRenderer.on('progress:update', callback),
  onGenerationComplete: (callback) => ipcRenderer.on('generation:complete', callback),
  onError: (callback) => ipcRenderer.on('error', callback),

  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose Node.js path utilities for the renderer
const path = require('path');
contextBridge.exposeInMainWorld('pathAPI', {
  join: (...args) => path.join(...args),
  dirname: (filePath) => path.dirname(filePath),
  basename: (filePath) => path.basename(filePath),
  extname: (filePath) => path.extname(filePath),
  resolve: (...args) => path.resolve(...args),
  sep: path.sep
});

// Expose some OS utilities
const os = require('os');
contextBridge.exposeInMainWorld('osAPI', {
  platform: () => process.platform,
  arch: () => process.arch,
  homedir: () => os.homedir(),
  tmpdir: () => os.tmpdir()
});