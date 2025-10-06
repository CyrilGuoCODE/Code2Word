/**
 * Utility functions for the renderer process
 */

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Format date for display
function formatDate(date) {
  return new Date(date).toLocaleString();
}

// Debounce function
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

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, duration);
}

// Get file icon based on extension
function getFileIcon(extension, isDirectory = false) {
  if (isDirectory) return '📁';
  
  const iconMap = {
    '.js': '📄',
    '.ts': '📄',
    '.jsx': '⚛️',
    '.tsx': '⚛️',
    '.vue': '💚',
    '.py': '🐍',
    '.java': '☕',
    '.c': '🔧',
    '.cpp': '🔧',
    '.cs': '🔷',
    '.php': '🐘',
    '.rb': '💎',
    '.go': '🐹',
    '.rs': '🦀',
    '.swift': '🍎',
    '.html': '🌐',
    '.css': '🎨',
    '.scss': '🎨',
    '.json': '📋',
    '.xml': '📋',
    '.md': '📝',
    '.txt': '📄',
    '.sql': '🗃️',
    '.sh': '⚡',
    '.bat': '⚡',
    '.ps1': '⚡'
  };
  
  return iconMap[extension?.toLowerCase()] || '📄';
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}