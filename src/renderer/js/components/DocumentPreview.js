/**
 * Document Preview Component
 * Handles document preview display
 */

class DocumentPreview {
  constructor(container) {
    this.container = container;
    this.previewData = null;
  }

  setPreview(previewData) {
    this.previewData = previewData;
    this.render();
  }

  render() {
    if (!this.previewData) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p>Document preview will appear here</p>
          <p class="text-muted">Click "Preview" to see document structure</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="preview-summary">
        <h4>Document Preview</h4>
        <div class="preview-stats">
          <div class="stat-item">
            <span class="stat-label">Files to include:</span>
            <span class="stat-value">${this.previewData.fileCount}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Estimated pages:</span>
            <span class="stat-value">${this.previewData.estimatedPages}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Document title:</span>
            <span class="stat-value">${this.previewData.settings.title}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Author:</span>
            <span class="stat-value">${this.previewData.settings.author}</span>
          </div>
        </div>
      </div>
      
      <div class="preview-structure">
        <h5>File Structure:</h5>
        <div class="structure-list">
          ${this.renderStructure(this.previewData.structure)}
        </div>
      </div>
      
      <div class="preview-settings">
        <h5>Document Settings:</h5>
        <div class="settings-grid">
          <div class="setting-item">
            <span class="setting-label">Font:</span>
            <span class="setting-value">${this.previewData.settings.formatting.fontFamily}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">Font Size:</span>
            <span class="setting-value">${this.previewData.settings.formatting.fontSize}pt</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">Code Font:</span>
            <span class="setting-value">${this.previewData.settings.formatting.codeFont}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">Syntax Highlighting:</span>
            <span class="setting-value">${this.previewData.settings.formatting.syntaxHighlighting ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderStructure(structure) {
    if (!structure || structure.length === 0) {
      return '<p class="text-muted">No files to include</p>';
    }

    return `
      <ul class="file-list">
        ${structure.map(file => `
          <li class="file-item">
            <span class="file-icon">${getFileIcon(file.type)}</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  clear() {
    this.previewData = null;
    this.render();
  }
}