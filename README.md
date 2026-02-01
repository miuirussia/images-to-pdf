# Image to PDF Converter

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

Desktop application for converting multiple images into a single PDF file with customizable page settings.

[Features](#features) • [Download](#download) • [Build](#build) • [Documentation](#documentation)

</div>

---

## ✨ Features

- **📸 Multiple Image Formats**
  - Supports: PNG, JPEG, WEBP, BMP, GIF, TIFF

- **🎯 Drag & Drop Interface**
  - Drop files directly into the app
  - Reorder images by dragging

- **⚙️ Customizable PDF Settings**
  - **Page Sizes:** A4, A3, A5, Letter, Legal, Custom
  - **Orientation:** Portrait or Landscape
  - **Image Placement:** Fit, Fill, or Original Size

- **🗜️ Smart Image Optimization**
  - Automatic PNG compression (oxipng)
  - JPEG optimization
  - Reduces final PDF size

- **🌗 Theme Support**
  - Light and Dark themes
  - Settings persistence

- **📱 Responsive Design**
  - Works on any screen size
  - Mobile-friendly layout on small windows

- **⚡ High Performance**
  - Fast image processing
  - Native Rust backend
  - Modern React frontend

---

## 📥 Download

### Latest Release

**Version:** 0.1.0

| Platform | Download | Size |
|----------|----------|------|
| 🪟 **Windows** | MSI / Setup.exe | ~8 MB |
| 🍎 **macOS** | DMG (ready) | ~6 MB |
| 🐧 **Linux** | DEB / AppImage | ~8-25 MB |

> **macOS users:** DMG available in `src-tauri/target/release/bundle/dmg/`
>
> **Windows users:** See [WINDOWS_BUILD.md](WINDOWS_BUILD.md) for build instructions
>
> **Linux users:** Build locally or use GitHub Actions

---

## 🚀 Quick Start

### For Users

1. **Download** the installer for your platform
2. **Install** the application
3. **Launch** Image to PDF Converter
4. **Drag & Drop** your images
5. **Configure** PDF settings (optional)
6. **Click** "Create PDF"
7. **Save** your PDF file

### For Developers

```bash
# Clone repository
git clone <your-repo-url>
cd images-to-pdf

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

---

## 🛠️ Build

### Prerequisites

- **Node.js** 20+
- **pnpm** (install via `npm install -g pnpm`)
- **Rust** (install from https://rustup.rs/)
- **Platform-specific tools:**
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: webkit2gtk, build-essential

### Build Commands

```bash
# Development mode
pnpm tauri dev

# Production build
pnpm tauri build
```

### Automated Builds (GitHub Actions)

The project includes GitHub Actions workflow for automatic multi-platform builds:

```bash
# Create and push a tag
git tag v0.1.0
git push origin v0.1.0
```

GitHub will automatically build for Windows, macOS, and Linux.

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed instructions.

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **Vite** - Build tool

### Backend
- **Tauri 2.0** - Desktop framework
- **Rust** - System programming
- **image** - Image processing
- **lopdf** - PDF generation
- **oxipng** - PNG optimization

### Development
- **pnpm** - Package manager
- **ESLint** - Linting
- **GitHub Actions** - CI/CD

---

## 📄 Documentation

- [BUILD_GUIDE.md](BUILD_GUIDE.md) - Detailed build instructions for all platforms
- [WINDOWS_BUILD.md](WINDOWS_BUILD.md) - How to get Windows version
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Manual testing scenarios
- [QUICK_TEST.md](QUICK_TEST.md) - 5-minute quick test
- [BUILD_REPORT.md](BUILD_REPORT.md) - Production build report
- [CLAUDE.md](CLAUDE.md) - Development guidelines

---

## 🗺️ Roadmap

- [x] Basic image to PDF conversion
- [x] Multiple page sizes
- [x] Image optimization
- [x] Drag & drop reordering
- [x] Dark/Light themes
- [x] Responsive design
- [x] GitHub Actions CI/CD
- [ ] Per-image progress indicator
- [ ] Multi-language support (EN, RU, etc.)
- [ ] Cloud storage integration
- [ ] Mobile versions (iOS/Android)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Amazing desktop app framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide Icons](https://lucide.dev/) - Icon library
- [oxipng](https://github.com/shssoichiro/oxipng) - PNG optimization

---

## 📊 Project Stats

- **Lines of Code:** ~2000+
- **Build Size:** 16 MB (macOS), ~8 MB (Windows/Linux installers)
- **Supported Formats:** 7 image formats
- **Page Sizes:** 5 predefined + custom
- **Development Time:** ~12 hours
- **Test Coverage:** 9 unit tests

---

<div align="center">

Made with ❤️ using Tauri + React + Rust

**[⬆ Back to Top](#image-to-pdf-converter)**

</div>
