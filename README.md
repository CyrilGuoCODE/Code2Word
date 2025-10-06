# Code2Word Converter

A desktop application built with Electron that converts code projects to Word documents with intelligent file filtering and formatting.

## Features

- 📁 **Smart File Scanning**: Automatically scans project directories with gitignore support
- 🎯 **Intelligent Filtering**: Excludes unnecessary files using gitignore rules and custom patterns
- 📄 **Word Document Generation**: Creates formatted Word documents using the docx library
- 🎨 **Syntax Highlighting**: Applies syntax highlighting for various programming languages
- ⚙️ **Configurable Settings**: Customizable document formatting, headers, footers, and exclusion rules
- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux
- 🎛️ **GUI & CLI**: Both graphical interface and command-line support

## Technology Stack

- **Desktop Framework**: Electron
- **Backend**: Node.js
- **Document Generation**: docx library
- **File Filtering**: ignore library (gitignore parsing)
- **Syntax Highlighting**: highlight.js
- **UI**: Native HTML/CSS/JavaScript (no framework dependencies)

## Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/code2word-converter.git
   cd code2word-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development version:
   ```bash
   npm run dev
   ```

### Building

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Usage

### GUI Application

1. Launch the application
2. Click "Open Project" to select your code project directory
3. Configure exclusion rules and document settings in the sidebar
4. Preview the document structure
5. Click "Generate Document" to create the Word file

### Command Line Interface

```bash
# Basic usage
code2word-converter --project /path/to/project --output /path/to/output.docx

# With custom settings
code2word-converter \
  --project /path/to/project \
  --output /path/to/output.docx \
  --title "My Project Documentation" \
  --author "Your Name" \
  --exclude "*.log,temp/,build/" \
  --no-gitignore
```

## Configuration

The application supports configuration through:

- **GUI Settings Panel**: Interactive configuration in the application
- **Configuration File**: JSON file stored in `~/.code2word/config.json`
- **Command Line Arguments**: Override settings via CLI parameters

### Example Configuration

```json
{
  "projectPath": "/path/to/project",
  "outputPath": "/path/to/documents",
  "exclusionRules": {
    "useGitignore": true,
    "customExclusions": ["node_modules/", "*.log", ".DS_Store"],
    "customInclusions": [],
    "excludeBySize": true,
    "maxFileSize": 10485760,
    "excludeBinaryFiles": true
  },
  "documentSettings": {
    "title": "Project Documentation",
    "author": "Code2Word Converter",
    "formatting": {
      "fontFamily": "Calibri",
      "fontSize": 11,
      "codeFont": "Consolas",
      "codeFontSize": 9,
      "syntaxHighlighting": true,
      "lineNumbers": false,
      "pageBreakBetweenFiles": true
    }
  }
}
```

## Development

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.js     # Application entry point
│   └── services/   # Backend services
├── preload/        # Preload scripts (security bridge)
├── renderer/       # Frontend (HTML/CSS/JS)
│   ├── index.html  # Main UI
│   ├── styles/     # CSS files
│   └── js/         # JavaScript modules
└── assets/         # Icons and resources
```

### Available Scripts

- `npm start` - Run the application
- `npm run dev` - Run in development mode with DevTools
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run format` - Format code with Prettier

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Supported File Types

The application recognizes and processes the following file types:

- **JavaScript/TypeScript**: .js, .ts, .jsx, .tsx, .vue
- **Python**: .py
- **Java**: .java
- **C/C++**: .c, .cpp, .h, .hpp
- **C#**: .cs
- **Web**: .html, .css, .scss, .xml
- **Configuration**: .json, .yaml, .yml, .toml, .ini
- **Documentation**: .md, .txt
- **Shell Scripts**: .sh, .bash, .ps1, .bat
- **And many more...**

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Document generation powered by [docx](https://github.com/dolanmiu/docx)
- File filtering using [ignore](https://github.com/kaelzhang/node-ignore)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)