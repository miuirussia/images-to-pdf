use crate::error::{AppError, Result};
use std::path::Path;

/// Maximum file size in bytes (50 MB)
const MAX_FILE_SIZE: u64 = 50 * 1024 * 1024;

/// Supported image formats
const SUPPORTED_FORMATS: &[&str] = &["png", "jpg", "jpeg", "webp", "bmp", "gif", "tiff", "tif"];

/// Validate image file format by extension
pub fn validate_image_format(path: &str) -> Result<()> {
    let path = Path::new(path);

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        .ok_or_else(|| AppError::UnsupportedFormat("No file extension".to_string()))?;

    if !SUPPORTED_FORMATS.contains(&extension.as_str()) {
        return Err(AppError::UnsupportedFormat(format!(
            ".{} (supported: {})",
            extension,
            SUPPORTED_FORMATS.join(", ")
        )));
    }

    Ok(())
}

/// Validate file size (must be less than 50 MB)
pub fn validate_file_size(path: &str) -> Result<()> {
    let metadata = std::fs::metadata(path)?;
    let size = metadata.len();

    if size > MAX_FILE_SIZE {
        return Err(AppError::ImageTooLarge(size));
    }

    Ok(())
}

/// Validate that file exists
pub fn validate_file_exists(path: &str) -> Result<()> {
    if !Path::new(path).exists() {
        return Err(AppError::ImageNotFound(path.to_string()));
    }
    Ok(())
}

/// Validate all aspects of an image file
pub fn validate_image(path: &str) -> Result<()> {
    validate_file_exists(path)?;
    validate_image_format(path)?;
    validate_file_size(path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_format_supported() {
        assert!(validate_image_format("/path/to/image.png").is_ok());
        assert!(validate_image_format("/path/to/image.jpg").is_ok());
        assert!(validate_image_format("/path/to/image.JPEG").is_ok());
        assert!(validate_image_format("/path/to/image.webp").is_ok());
    }

    #[test]
    fn test_validate_format_unsupported() {
        assert!(validate_image_format("/path/to/file.txt").is_err());
        assert!(validate_image_format("/path/to/file.pdf").is_err());
        assert!(validate_image_format("/path/to/file").is_err());
    }
}
