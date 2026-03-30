# Bulk Rename & Clean Tool

A modern, feature-rich web application for batch renaming and organizing files directly in your browser. Built with vanilla JavaScript, Tailwind CSS, and Material Design 3 principles.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

---

## ✨ Features

### Core Functionality
- **Drag & Drop Upload** - Intuitive file upload with visual feedback
- **Batch Renaming** - Sequential numbering with leading zeros (01, 02, 03...)
- **Case Conversion** - Convert filenames to UPPERCASE or lowercase
- **ZIP Download** - Bundle renamed files into a downloadable ZIP archive
- **Live Preview** - See changes before applying them
- **100% Client-Side** - All processing happens in your browser, no server uploads

### Advanced Features
- **🔃 Drag-to-Reorder** - Rearrange files by dragging rows in the preview table
- **📊 Smart Sorting** - Sort files by name, size, type, or original order
- **🔍 File Filtering** - Filter by file type (Images, Videos, Documents, Audio, Other)
- **↩️ Undo System** - Revert the last rename operation with history stack
- **📅 Date/Timestamp** - Add date or timestamp to filenames in multiple formats:
  - YYYY-MM-DD
  - DD-MM-YYYY
  - MM-DD-YYYY
  - Timestamp (HHMMSS)
  - Full DateTime (YYYYMMDD_HHMMSS)
- **🌓 Dark Mode** - Toggle between light and dark themes with persistence

---

## 🚀 Quick Start

### Option 1: Direct Browser Use
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start renaming files!

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## 📖 How to Use

### 1. Upload Files
- **Drag & drop** files onto the upload zone, or
- Click **"Select Files"** to open file browser
- Supports multiple file selection

### 2. Configure Settings
- **Base Filename** - Enter the prefix for renamed files (default: `Holi_Trip`)
- **Add Date/Time** - Optional timestamp or date format
- **Filter by Type** - Show only specific file categories
- **Sort Files** - Reorder files by various criteria

### 3. Arrange Files (Optional)
- **Drag rows** in the preview table to manually reorder
- The order will be used when renaming

### 4. Rename Files
Choose one of the following operations:
- **🔄 Rename Files** - Sequential numbering (e.g., `Holi_Trip_01.jpg`, `Holi_Trip_02.jpg`)
- **🔠 UPPER** - Convert all filenames to uppercase
- **🔡 lower** - Convert all filenames to lowercase

### 5. Download or Reset
- **📥 Download ZIP** - Get all renamed files as a compressed archive
- **↩️ Undo** - Revert the last rename operation
- **🗑️ Reset** - Clear all files and start over

---

## 🏗️ Project Structure

```
bulk-rename-clean-tool/
├── index.html          # Main HTML structure (Material Design 3)
├── style.css           # Custom CSS styles
├── script.js           # Application logic
├── README.md           # This file
└── assets/            # (Optional) Additional assets
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and File API |
| **CSS3** | Custom styles and animations |
| **Tailwind CSS** | Utility-first CSS framework |
| **Vanilla JavaScript** | Application logic (no frameworks) |
| **JSZip** | ZIP file generation (CDN) |
| **Material Design 3** | Design system and icons |
| **Google Fonts** | Manrope & Inter typography |

---

## 🎨 Design System

The app follows **Material Design 3** guidelines with:
- Custom color palette (primary: `#2f1bc8`, secondary: `#006a61`)
- Manrope for headlines, Inter for body text
- Material Icons for consistent iconography
- Glassmorphism effects with backdrop blur
- Smooth transitions and micro-interactions

---

## 🌐 Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

**Note:** Requires modern browser with support for:
- ES6+ JavaScript
- CSS Grid & Flexbox
- File API
- Blob & URL APIs

---

## 🔒 Privacy & Security

- **100% Client-Side**: All file processing happens in your browser
- **No Server Uploads**: Files never leave your computer
- **No Tracking**: No analytics, cookies, or telemetry
- **Open Source**: Full transparency, inspect the code yourself

---

## 🧪 Testing

The application has been tested with:
- Various file types (images, documents, videos, audio)
- Large batches (100+ files)
- Different browser environments
- Dark/light mode switching
- Drag-and-drop functionality
- Undo/redo operations

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request** with detailed description

### Development Setup
```bash
# Clone repository
git clone https://github.com/yourusername/bulk-rename-clean-tool.git
cd bulk-rename-clean-tool

# Start local server (choose one)
python -m http.server 8000
# or
npx http-server
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Bulk Rename & Clean Tool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Material Design 3** - Google's design system
- **Tailwind CSS** - Utility-first CSS framework
- **JSZip** - JavaScript library for creating ZIP files
- **Google Fonts** - Manrope & Inter typefaces
- **Material Icons** - Icon library

---

## 📧 Contact

For questions, suggestions, or issues:
- **GitHub Issues**: [Create an issue](../../issues)
- **Email**: support@example.com (replace with your email)

---

## 🔄 Changelog

### v1.0.0 (2024-12-19)
- Initial release
- Material Design 3 UI with Tailwind CSS
- Drag & drop file upload
- Batch renaming with sequential numbering
- Case conversion (upper/lower)
- Date/timestamp support (6 formats)
- File filtering and sorting
- Drag-to-reorder functionality
- Undo system with history stack
- Dark mode with persistence
- ZIP download with compression
- Responsive design for mobile & desktop

---

**Made with ❤️ by praX**

*If you find this tool useful, please give it a star ⭐ on GitHub!*
