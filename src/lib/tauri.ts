import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import type {
  ValidationResult,
  ImageInfo,
  PdfSettings,
  GenerationResult,
} from '@/types';

// ============================================================================
// Image Validation & Info
// ============================================================================

/**
 * Validate multiple image file paths
 * @param paths - Array of absolute file paths to validate
 * @returns ValidationResult with valid and invalid paths
 */
export async function validateImages(
  paths: string[]
): Promise<ValidationResult> {
  return await invoke<ValidationResult>('validate_images', { paths });
}

/**
 * Get metadata for a single image
 * @param path - Absolute file path to the image
 * @returns ImageInfo with width, height, format, and size
 */
export async function getImageInfo(path: string): Promise<ImageInfo> {
  return await invoke<ImageInfo>('get_image_info', { path });
}

/**
 * Get image thumbnail as base64 data URL
 * @param path - Absolute file path to the image
 * @param size - Thumbnail size (default: 96)
 * @returns Base64 encoded data URL
 */
export async function getImageThumbnail(
  path: string,
  size: number = 96
): Promise<string> {
  return await invoke<string>('get_image_thumbnail', { path, size });
}

// ============================================================================
// PDF Generation
// ============================================================================

/**
 * Generate PDF from images
 * @param imagePaths - Array of absolute paths to images (in order)
 * @param outputPath - Absolute path where to save the PDF
 * @param settings - PDF generation settings
 * @returns GenerationResult with success status and optional error
 */
export async function generatePdf(
  imagePaths: string[],
  outputPath: string,
  settings: PdfSettings
): Promise<GenerationResult> {
  return await invoke<GenerationResult>('generate_pdf', {
    imagePaths,
    outputPath,
    settings,
  });
}

// ============================================================================
// File Dialogs
// ============================================================================

/**
 * Open file picker dialog to select images
 * @returns Array of selected file paths, or null if cancelled
 */
export async function selectImages(): Promise<string[] | null> {
  const selected = await open({
    multiple: true,
    directory: false,
    filters: [
      {
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tiff', 'tif'],
      },
    ],
  });

  if (!selected) {
    return null;
  }

  // open() can return string | string[] when multiple is true
  return Array.isArray(selected) ? selected : [selected];
}

/**
 * Open save dialog to select output PDF path
 * @param defaultName - Default file name for the PDF
 * @returns Selected file path, or null if cancelled
 */
export async function selectOutputPath(
  defaultName: string = 'output.pdf'
): Promise<string | null> {
  const selected = await save({
    defaultPath: defaultName,
    filters: [
      {
        name: 'PDF Document',
        extensions: ['pdf'],
      },
    ],
  });

  return selected;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if running in Tauri environment
 * @returns true if running in Tauri, false otherwise
 */
export function isTauri(): boolean {
  return '__TAURI__' in window;
}

/**
 * Get platform information from navigator
 * @returns Platform name
 */
export function getPlatform(): string {
  if (!isTauri()) {
    return 'web';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  return 'unknown';
}
