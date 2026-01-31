use serde::Serialize;
use thiserror::Error;

/// Application errors that can be returned to the frontend
#[derive(Debug, Error, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("Unsupported image format: {0}")]
    UnsupportedFormat(String),

    #[error("Image file not found: {0}")]
    ImageNotFound(String),

    #[error("Failed to read image: {0}")]
    ImageReadError(String),

    #[error("Image processing error: {0}")]
    ImageProcessingError(String),

    #[error("Image file too large: {0} bytes (max 50 MB)")]
    ImageTooLarge(u64),

    #[error("Failed to generate PDF: {0}")]
    PdfGenerationError(String),

    #[error("IO error: {0}")]
    IoError(String),

    #[error("Invalid custom page dimensions")]
    InvalidDimensions,

    #[error("No images provided")]
    NoImages,
}

// Convert std::io::Error to AppError
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::IoError(err.to_string())
    }
}

// Convert image::ImageError to AppError
impl From<image::ImageError> for AppError {
    fn from(err: image::ImageError) -> Self {
        AppError::ImageReadError(err.to_string())
    }
}

/// Result type for Tauri commands
pub type Result<T> = std::result::Result<T, AppError>;
