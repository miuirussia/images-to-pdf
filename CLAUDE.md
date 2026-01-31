# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop application for converting multiple images into a single PDF file with customizable page settings. Built with Tauri 2.0 (Rust backend) and React + TypeScript (frontend).

**Target platforms:** Windows, macOS, Linux

## Development Commands

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build the application
pnpm tauri build

# Run Rust tests
cd src-tauri && cargo test

# Run Rust linter
cd src-tauri && cargo clippy

# Build for specific platform
pnpm tauri build --target <platform>
```

## Architecture

### Frontend-Backend Communication

The app uses Tauri commands for frontend-backend communication. Three main commands:

- `validate_images`: Validates image file paths and formats before processing
- `generate_pdf`: Generates PDF from images with specified settings
- `get_image_info`: Retrieves image metadata (dimensions, format, size)

### State Management

Zustand manages frontend state including:
- Loaded image list with paths and metadata
- PDF generation settings (page size, orientation, fit mode)
- UI state (progress indicators, error messages)

### Image Processing Flow

1. User loads images via drag-drop or file picker
2. Frontend calls `validate_images` to check formats and integrity
3. Valid images are stored in Zustand state with metadata
4. User configures PDF settings in SettingsPanel
5. On "Create PDF" click, frontend calls `generate_pdf` with image paths and settings
6. Rust backend processes images and generates PDF using `printpdf` or `lopdf` library
7. Progress updates displayed via UI indicators

### Supported Image Formats

PNG, JPEG, JPG, WEBP, BMP, GIF, TIFF (validated in Rust backend)

### PDF Settings

- **Page sizes:** A4 (default), A3, A5, Letter, Legal, Custom (width/height in mm)
- **Orientation:** Portrait (default), Landscape
- **Fit modes:**
  - Fit (fit to page keeping aspect ratio)
  - Fill (fill page, may crop)
  - Original (original size, centered)

## Project Structure

### Frontend (`src/`)

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── ImageUploader    # Drag-drop and file picker
│   ├── ImageList        # Scrollable list of loaded images
│   ├── ImageItem        # Individual image preview with reorder/delete
│   ├── SettingsPanel    # PDF configuration (size, orientation, fit mode)
│   ├── ExportButton     # Triggers PDF generation
│   └── ProgressDialog   # Shows generation progress
├── lib/
│   ├── tauri.ts         # Tauri API wrappers
│   └── utils.ts
└── types/
    └── index.ts         # TypeScript interfaces
```

### Backend (`src-tauri/src/`)

```
src-tauri/src/
├── commands/
│   ├── image.rs         # Image validation and metadata extraction
│   └── pdf.rs           # PDF generation logic
├── utils/
│   └── validation.rs    # File format and size validation
├── main.rs              # Tauri app entry point
└── lib.rs
```

## Performance Requirements

- Single image processing: < 500ms
- PDF generation from 50 images: < 10 seconds
- Image optimization: PNG (oxipng) and JPEG compression
- Max file size per image: 50 MB
- Max images per batch: 100

## Error Handling

Three error categories:

1. **Validation errors:** Unsupported format, corrupted image, file too large
2. **System errors:** Permission denied, insufficient disk space, write errors
3. **User errors:** No images selected, invalid page size settings

Display errors using:
- Toast notifications for minor issues
- Dialogs for critical errors
- Inline validation for input fields

## Technology Stack

- **Frontend:** React 18+, TypeScript, Shadcn UI, Tailwind 4, Zustand, Vite
- **Backend:** Tauri 2.0, Rust (image crate, printpdf/lopdf)
- **Package manager:** pnpm

## Key Implementation Notes

- All file processing happens locally (no network requests)
- Use TypeScript strict mode for frontend
- Use Rust clippy for backend code quality
- Implement drag-drop reordering in ImageList using HTML5 drag API or library
- Store last-used settings in Tauri's store plugin for persistence
- Support light/dark theme using Shadcn's theme provider
