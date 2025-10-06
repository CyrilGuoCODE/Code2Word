/**
 * Main application logic for the renderer process
 */

class Code2WordApp {
  constructor() {
    this.currentProject = null;
    this.currentConfig = null;
    this.fileTree = null;
    
    this.init();
  }

  async init() {
    try {
      // Load default configuration
      this.currentConfig = await electronAPI.getDefaultConfig();
      
      // Initialize UI components
      this.initializeEventListeners();
      this.updateUI();
      
      // Load app version
      const version = await electronAPI.getVersion();
      document.getElementById('appVersion').textContent = `v${version}`;
      
      console.log('Code2Word app initialized');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showNotification('Failed to initialize application', 'error');
    }
  }

  initializeEventListeners() {
    // Open project button
    document.getElementById('openProjectBtn').addEventListener('click', () => {
      this.openProject();
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      if (this.currentProject) {
        this.scanProject();
      }
    });

    // Expand all button
    document.getElementById('expandAllBtn').addEventListener('click', () => {
      this.expandAllFiles();
    });

    // Preview button
    document.getElementById('previewBtn').addEventListener('click', () => {
      this.previewDocument();
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', () => {
      this.generateDocument();
    });

    // Listen for project opened from menu
    electronAPI.onProjectOpened((event, projectPath) => {
      this.setProject(projectPath);
    });

    // Listen for progress updates
    electronAPI.onProgressUpdate((event, progress) => {
      this.updateProgress(progress);
    });

    // Listen for generation complete
    electronAPI.onGenerationComplete((event, result) => {
      this.onGenerationComplete(result);
    });

    // Listen for errors
    electronAPI.onError((event, error) => {
      console.error('Application error:', error);
      showNotification(error.message || 'An error occurred', 'error');
    });
  }

  async openProject() {
    try {
      const projectPath = await electronAPI.selectDirectory();
      if (projectPath) {
        await this.setProject(projectPath);
      }
    } catch (error) {
      console.error('Failed to open project:', error);
      showNotification('Failed to open project', 'error');
    }
  }

  async setProject(projectPath) {
    try {
      this.currentProject = projectPath;
      this.currentConfig.projectPath = projectPath;
      
      // Update UI
      this.updateStatusText(`项目: ${pathAPI.basename(projectPath)}`);
      
      // Scan project files
      await this.scanProject();
      
      showNotification('项目加载成功', 'success');
    } catch (error) {
      console.error('Failed to set project:', error);
      showNotification('项目加载失败', 'error');
    }
  }

  async scanProject() {
    if (!this.currentProject) return;

    try {
      this.updateStatusText('正在扫描项目文件...');
      
      const files = await electronAPI.scanDirectory(
        this.currentProject, 
        this.currentConfig.exclusionRules
      );
      
      this.fileTree = files;
      this.renderFileTree();
      this.updateFileCount();
      this.updateButtons();
      
      this.updateStatusText('就绪');
    } catch (error) {
      console.error('Failed to scan project:', error);
      showNotification('扫描项目文件失败', 'error');
      this.updateStatusText('错误');
    }
  }

  renderFileTree() {
    const container = document.getElementById('fileTree');
    
    if (!this.fileTree || this.fileTree.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>未找到文件</p>
          <p class="text-muted">项目目录似乎是空的</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this.renderFileNodes(this.fileTree, container);
  }

  renderFileNodes(nodes, container, level = 0) {
    nodes.forEach(node => {
      const item = document.createElement('div');
      item.className = `file-tree-item ${node.excluded ? 'excluded' : ''}`;
      item.style.paddingLeft = `${level * 16 + 8}px`;
      
      const icon = getFileIcon(node.extension, node.type === 'directory');
      const size = node.type === 'file' ? formatFileSize(node.size) : '';
      
      item.innerHTML = `
        <span class="file-tree-icon">${icon}</span>
        <span class="file-tree-name">${node.name}</span>
        ${size ? `<span class="file-tree-size">${size}</span>` : ''}
      `;
      
      if (node.excluded) {
        item.title = `已排除: ${node.exclusionReason}`;
      }
      
      container.appendChild(item);
      
      // Render children if directory
      if (node.type === 'directory' && node.children) {
        this.renderFileNodes(node.children, container, level + 1);
      }
    });
  }

  expandAllFiles() {
    // This would expand all directory nodes in the file tree
    // For now, just show a notification
    showNotification('展开全部功能即将推出', 'info');
  }

  async previewDocument() {
    if (!this.fileTree) return;

    try {
      const preview = await electronAPI.previewDocument(this.fileTree, this.currentConfig);
      this.showPreview(preview);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      showNotification('Failed to generate preview', 'error');
    }
  }

  showPreview(preview) {
    const container = document.getElementById('previewContent');
    container.innerHTML = `
      <div class="preview-summary">
        <h4>Document Preview</h4>
        <p><strong>Files to include:</strong> ${preview.fileCount}</p>
        <p><strong>Estimated pages:</strong> ${preview.estimatedPages}</p>
        <p><strong>Document title:</strong> ${preview.settings.title}</p>
        <p><strong>Author:</strong> ${preview.settings.author}</p>
      </div>
      <div class="preview-structure">
        <h5>File Structure:</h5>
        <ul>
          ${preview.structure.map(file => `
            <li>${file.name} (${formatFileSize(file.size)})</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  async generateDocument() {
    if (!this.fileTree) return;

    try {
      // Show progress modal
      this.showProgressModal();
      
      const result = await electronAPI.generateDocument(this.fileTree, this.currentConfig);
      
      if (result.success) {
        showNotification('Document generated successfully!', 'success');
        this.showGenerationResult(result);
      } else {
        showNotification('Document generation failed', 'error');
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
      showNotification('Failed to generate document', 'error');
    } finally {
      this.hideProgressModal();
    }
  }

  showProgressModal() {
    const modal = document.getElementById('progressModal');
    modal.classList.add('show');
  }

  hideProgressModal() {
    const modal = document.getElementById('progressModal');
    modal.classList.remove('show');
  }

  updateProgress(progress) {
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const progressStats = document.getElementById('progressStats');
    
    progressText.textContent = `Processing: ${progress.currentFile}`;
    
    const percentage = progress.totalFiles > 0 
      ? (progress.processedFiles / progress.totalFiles) * 100 
      : 0;
    progressFill.style.width = `${percentage}%`;
    
    progressStats.textContent = `${progress.processedFiles} / ${progress.totalFiles} files processed`;
    
    if (progress.errors && progress.errors.length > 0) {
      this.showProgressErrors(progress.errors);
    }
  }

  showProgressErrors(errors) {
    const errorsContainer = document.getElementById('progressErrors');
    const errorList = document.getElementById('errorList');
    
    errorList.innerHTML = errors.map(error => `
      <li>${error.file}: ${error.error}</li>
    `).join('');
    
    errorsContainer.style.display = 'block';
  }

  showGenerationResult(result) {
    const message = `
      Document generated successfully!
      
      Output: ${result.outputPath}
      Files processed: ${result.statistics.processedFiles}
      ${result.statistics.errors > 0 ? `Errors: ${result.statistics.errors}` : ''}
    `;
    
    electronAPI.showMessageBox({
      type: 'info',
      title: 'Generation Complete',
      message: 'Document Generated',
      detail: message,
      buttons: ['OK', 'Open File Location']
    }).then(response => {
      if (response.response === 1) {
        // Open file location (would need to implement)
        console.log('Open file location:', result.outputPath);
      }
    });
  }

  onGenerationComplete(result) {
    this.hideProgressModal();
    this.showGenerationResult(result);
  }

  updateFileCount() {
    if (!this.fileTree) {
      document.getElementById('fileCount').textContent = '0 个文件';
      return;
    }

    const count = this.countFiles(this.fileTree);
    document.getElementById('fileCount').textContent = `${count} 个文件`;
  }

  countFiles(nodes) {
    let count = 0;
    nodes.forEach(node => {
      if (node.type === 'file' && !node.excluded) {
        count++;
      } else if (node.type === 'directory' && node.children) {
        count += this.countFiles(node.children);
      }
    });
    return count;
  }

  updateButtons() {
    const hasFiles = this.fileTree && this.countFiles(this.fileTree) > 0;
    
    document.getElementById('previewBtn').disabled = !hasFiles;
    document.getElementById('generateBtn').disabled = !hasFiles;
  }

  updateStatusText(text) {
    document.getElementById('statusText').textContent = text;
  }

  updateUI() {
    // Update UI based on current state
    this.updateButtons();
    this.updateFileCount();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new Code2WordApp();
});