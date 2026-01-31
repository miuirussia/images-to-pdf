// ============================================================================
// Enum Types
// ============================================================================

/**
 * Supported page sizes for PDF generation
 */
export type PageSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Custom';

/**
 * Page orientation
 */
export type Orientation = 'Portrait' | 'Landscape';

/**
 * Image fit modes for PDF pages
 */
export type FitMode = 'Fit' | 'Fill' | 'Original';

// ============================================================================
// PDF Settings
// ============================================================================

/**
 * PDF generation settings
 */
export interface PdfSettings {
  /** Page size (A4, A3, A5, Letter, Legal, Custom) */
  pageSize: PageSize;

  /** Custom page width in millimeters (only used if pageSize is 'Custom') */
  customWidth?: number;

  /** Custom page height in millimeters (only used if pageSize is 'Custom') */
  customHeight?: number;

  /** Page orientation (Portrait or Landscape) */
  orientation: Orientation;

  /** How to fit images on the page */
  fitMode: FitMode;
}

/**
 * Default PDF settings
 */
export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  pageSize: 'A4',
  orientation: 'Portrait',
  fitMode: 'Fit',
};

// ============================================================================
// Image Types
// ============================================================================

/**
 * Image metadata information
 */
export interface ImageInfo {
  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** Image format (PNG, JPEG, WEBP, etc.) */
  format: string;

  /** File size in bytes */
  sizeBytes: number;
}

/**
 * Image item in the list
 */
export interface ImageItem {
  /** Unique identifier for the image */
  id: string;

  /** Absolute file path */
  path: string;

  /** File name (extracted from path) */
  name: string;

  /** Image metadata (populated after validation) */
  info?: ImageInfo;

  /** Base64 thumbnail data URL (populated after loading) */
  thumbnail?: string;
}

// ============================================================================
// Validation & Generation Results
// ============================================================================

/**
 * Result of image validation
 */
export interface ValidationResult {
  /** List of valid image paths */
  valid: string[];

  /** List of invalid image paths with error messages */
  invalid: Array<{
    path: string;
    error: string;
  }>;
}

/**
 * Result of PDF generation
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;

  /** Path to the generated PDF file (if successful) */
  outputPath?: string;

  /** Error message (if failed) */
  error?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Application error categories
 */
export type ErrorCategory = 'validation' | 'system' | 'user';

/**
 * Application error
 */
export interface AppError {
  /** Error category */
  category: ErrorCategory;

  /** Error message */
  message: string;

  /** Additional error details */
  details?: string;
}

/**
 * Specific error types for validation
 */
export type ValidationError =
  | 'UnsupportedFormat'
  | 'CorruptedImage'
  | 'FileTooLarge'
  | 'FileNotFound';

/**
 * Specific error types for system errors
 */
export type SystemError =
  | 'PermissionDenied'
  | 'InsufficientDiskSpace'
  | 'WriteError'
  | 'ReadError';

/**
 * Specific error types for user errors
 */
export type UserError =
  | 'NoImagesSelected'
  | 'InvalidPageSize'
  | 'InvalidCustomDimensions';

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Format file size from bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Extract file name from path
 */
export function extractFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

/**
 * Generate unique ID for image items
 */
export function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
