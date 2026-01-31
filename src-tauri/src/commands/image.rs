use crate::error::Result;
use crate::utils::validation::validate_image;
use serde::{Deserialize, Serialize};

/// Image metadata
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub size_bytes: u64,
}

/// Validation result
#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: Vec<String>,
    pub invalid: Vec<InvalidImage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvalidImage {
    pub path: String,
    pub error: String,
}

/// Validate multiple image paths
#[tauri::command]
pub fn validate_images(paths: Vec<String>) -> ValidationResult {
    let mut valid = Vec::new();
    let mut invalid = Vec::new();

    for path in paths {
        match validate_image(&path) {
            Ok(_) => valid.push(path),
            Err(e) => invalid.push(InvalidImage {
                path,
                error: e.to_string(),
            }),
        }
    }

    ValidationResult { valid, invalid }
}

/// Get metadata for a single image
#[tauri::command]
pub fn get_image_info(path: String) -> Result<ImageInfo> {
    // Validate first
    validate_image(&path)?;

    // Open and read image
    let img = image::open(&path)?;

    // Get file size
    let metadata = std::fs::metadata(&path)?;
    let size_bytes = metadata.len();

    // Extract format from path
    let format = std::path::Path::new(&path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("unknown")
        .to_uppercase();

    Ok(ImageInfo {
        width: img.width(),
        height: img.height(),
        format,
        size_bytes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_images_empty() {
        let result = validate_images(vec![]);
        assert_eq!(result.valid.len(), 0);
        assert_eq!(result.invalid.len(), 0);
    }

    #[test]
    fn test_validate_images_invalid_format() {
        let result = validate_images(vec!["test.txt".to_string()]);
        assert_eq!(result.valid.len(), 0);
        assert_eq!(result.invalid.len(), 1);
    }
}
