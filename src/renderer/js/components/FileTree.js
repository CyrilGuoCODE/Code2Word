/**
 * File Tree Component
 * Handles file tree display and interaction
 */

class FileTree {
  constructor(container) {
    this.container = container;
    this.files = [];
    this.selectedFiles = new Set();
    this.expandedDirs = new Set();
  }

  setFiles(files) {
    this.files = files;
    this.render();
  }

  render() {
    if (!this.files || this.files.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <p>No files found</p>
          <p class="text-muted">The project directory appears to be empty</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = '';
    this.renderNodes(this.files, this.container, 0);
  }

  renderNodes(nodes, container, level) {
    nodes.forEach(node => {
      const item = this.createFileItem(node, level);
      container.appendChild(item);

      if (node.type === 'directory' && node.children && this.expandedDirs.has(node.path)) {
        const childContainer = document.createElement('div');
        childContainer.className = 'file-tree-children';
        this.renderNodes(node.children, childContainer, level + 1);
        container.appendChild(childContainer);
      }
    });
  }

  createFileItem(node, level) {
    const item = document.createElement('div');
    item.className = `file-tree-item ${node.excluded ? 'excluded' : ''}`;
    item.style.paddingLeft = `${level * 16 + 8}px`;
    item.dataset.path = node.path;

    const icon = getFileIcon(node.extension, node.type === 'directory');
    const size = node.type === 'file' ? formatFileSize(node.size) : '';
    const expandIcon = node.type === 'directory' 
      ? (this.expandedDirs.has(node.path) ? '▼' : '▶') 
      : '';

    item.innerHTML = `
      ${expandIcon ? `<span class="expand-icon">${expandIcon}</span>` : '<span class="expand-icon"></span>'}
      <span class="file-tree-icon">${icon}</span>
      <span class="file-tree-name">${node.name}</span>
      ${size ? `<span class="file-tree-size">${size}</span>` : ''}
    `;

    if (node.excluded) {
      item.title = `Excluded: ${node.exclusionReason}`;
    }

    // Add click handlers
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleItemClick(node, item);
    });

    if (node.type === 'directory') {
      const expandIcon = item.querySelector('.expand-icon');
      expandIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDirectory(node);
      });
    }

    return item;
  }

  handleItemClick(node, item) {
    if (this.selectedFiles.has(node.path)) {
      this.selectedFiles.delete(node.path);
      item.classList.remove('selected');
    } else {
      this.selectedFiles.add(node.path);
      item.classList.add('selected');
    }

    this.container.dispatchEvent(new CustomEvent('selectionChanged', {
      detail: Array.from(this.selectedFiles)
    }));
  }

  toggleDirectory(node) {
    if (this.expandedDirs.has(node.path)) {
      this.expandedDirs.delete(node.path);
    } else {
      this.expandedDirs.add(node.path);
    }
    this.render();
  }

  expandAll() {
    const addAllDirs = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'directory') {
          this.expandedDirs.add(node.path);
          if (node.children) {
            addAllDirs(node.children);
          }
        }
      });
    };

    addAllDirs(this.files);
    this.render();
  }

  collapseAll() {
    this.expandedDirs.clear();
    this.render();
  }

  getSelectedFiles() {
    return Array.from(this.selectedFiles);
  }

  clearSelection() {
    this.selectedFiles.clear();
    this.container.querySelectorAll('.file-tree-item.selected')
      .forEach(item => item.classList.remove('selected'));
  }
}