/**
 * Configuration Panel Component
 * Handles project configuration UI
 */

class ConfigPanel {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="config-form">
        <div class="form-group">
          <label class="form-label">项目路径</label>
          <input type="text" class="form-input" id="projectPath" 
                 value="${this.config.projectPath}" readonly>
        </div>
        
        <div class="form-group">
          <label class="form-label">输出目录</label>
          <input type="text" class="form-input" id="outputPath" 
                 value="${this.config.outputPath}">
        </div>
        
        <div class="form-group">
          <div class="form-checkbox">
            <input type="checkbox" id="useGitignore" 
                   ${this.config.exclusionRules.useGitignore ? 'checked' : ''}>
            <label for="useGitignore">使用 .gitignore 规则</label>
          </div>
        </div>
        
        <div class="form-group">
          <div class="form-checkbox">
            <input type="checkbox" id="excludeBinary" 
                   ${this.config.exclusionRules.excludeBinaryFiles ? 'checked' : ''}>
            <label for="excludeBinary">排除二进制文件</label>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">自定义排除规则（每行一个）</label>
          <textarea class="form-input" id="customExclusions" rows="4"
                    placeholder="node_modules/&#10;*.log&#10;dist/">${this.config.exclusionRules.customExclusions.join('\n')}</textarea>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }

  bindEvents() {
    // Add event listeners for form changes
    const form = this.container.querySelector('.config-form');
    
    form.addEventListener('change', (e) => {
      this.updateConfig(e.target);
    });
  }

  updateConfig(element) {
    switch (element.id) {
      case 'outputPath':
        this.config.outputPath = element.value;
        break;
      case 'useGitignore':
        this.config.exclusionRules.useGitignore = element.checked;
        break;
      case 'excludeBinary':
        this.config.exclusionRules.excludeBinaryFiles = element.checked;
        break;
      case 'customExclusions':
        this.config.exclusionRules.customExclusions = element.value
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.trim());
        break;
    }
    
    // Trigger config change event
    this.container.dispatchEvent(new CustomEvent('configChanged', {
      detail: this.config
    }));
  }
}