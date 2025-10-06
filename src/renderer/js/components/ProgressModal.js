/**
 * Progress Modal Component
 * Handles document generation progress display
 */

class ProgressModal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.progressText = this.modal.querySelector('#progressText');
    this.progressFill = this.modal.querySelector('#progressFill');
    this.progressStats = this.modal.querySelector('#progressStats');
    this.errorContainer = this.modal.querySelector('#progressErrors');
    this.errorList = this.modal.querySelector('#errorList');
    this.cancelBtn = this.modal.querySelector('#cancelBtn');
    
    this.bindEvents();
  }

  bindEvents() {
    this.cancelBtn.addEventListener('click', () => {
      this.hide();
      // Emit cancel event
      this.modal.dispatchEvent(new CustomEvent('cancelled'));
    });

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  show() {
    this.reset();
    this.modal.classList.add('show');
  }

  hide() {
    this.modal.classList.remove('show');
  }

  reset() {
    this.progressText.textContent = 'Preparing...';
    this.progressFill.style.width = '0%';
    this.progressStats.textContent = '0 / 0 files processed';
    this.errorContainer.style.display = 'none';
    this.errorList.innerHTML = '';
  }

  updateProgress(progress) {
    this.progressText.textContent = `Processing: ${progress.currentFile || 'Preparing...'}`;
    
    const percentage = progress.totalFiles > 0 
      ? (progress.processedFiles / progress.totalFiles) * 100 
      : 0;
    this.progressFill.style.width = `${percentage}%`;
    
    this.progressStats.textContent = `${progress.processedFiles} / ${progress.totalFiles} files processed`;
    
    if (progress.errors && progress.errors.length > 0) {
      this.showErrors(progress.errors);
    }
  }

  showErrors(errors) {
    this.errorList.innerHTML = errors.map(error => `
      <li>
        <strong>${error.file}:</strong> ${error.error}
      </li>
    `).join('');
    
    this.errorContainer.style.display = 'block';
  }

  setComplete() {
    this.progressText.textContent = 'Generation complete!';
    this.progressFill.style.width = '100%';
    this.cancelBtn.textContent = 'Close';
  }

  setError(message) {
    this.progressText.textContent = `Error: ${message}`;
    this.progressFill.style.backgroundColor = 'var(--danger-color)';
    this.cancelBtn.textContent = 'Close';
  }
}