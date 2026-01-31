use crate::error::AppError;
use image::ImageFormat;
use std::path::Path;
use std::fs;

/// Optimize PNG image using oxipng
///
/// # Arguments
/// * `input_path` - Path to the input PNG file
/// * `output_path` - Path where optimized PNG will be saved
///
/// # Returns
/// * `Ok(())` if optimization was successful
/// * `Err(AppError)` if optimization failed
pub fn optimize_png(input_path: &Path, output_path: &Path) -> Result<(), AppError> {
    // Read the PNG file
    let input_data = fs::read(input_path)
        .map_err(|e| AppError::IoError(format!("Failed to read PNG file: {}", e)))?;

    // Configure oxipng options
    let options = oxipng::Options {
        strip: oxipng::StripChunks::Safe, // Remove unnecessary chunks
        ..Default::default()
    };

    // Optimize the PNG
    let optimized_data = oxipng::optimize_from_memory(&input_data, &options)
        .map_err(|e| AppError::ImageProcessingError(format!("PNG optimization failed: {}", e)))?;

    // Write optimized PNG to output
    fs::write(output_path, optimized_data)
        .map_err(|e| AppError::IoError(format!("Failed to write optimized PNG: {}", e)))?;

    Ok(())
}

/// Optimize JPEG image by re-encoding with specified quality
///
/// # Arguments
/// * `input_path` - Path to the input JPEG file
/// * `output_path` - Path where optimized JPEG will be saved
/// * `quality` - JPEG quality (1-100, default: 85)
///
/// # Returns
/// * `Ok(())` if optimization was successful
/// * `Err(AppError)` if optimization failed
pub fn optimize_jpeg(input_path: &Path, output_path: &Path, quality: u8) -> Result<(), AppError> {
    // Ensure quality is in valid range
    let quality = quality.clamp(1, 100);

    // Load the image
    let img = image::open(input_path)
        .map_err(|e| AppError::ImageReadError(format!("Failed to read JPEG: {}", e)))?;

    // Create JPEG encoder with specified quality
    let mut output = fs::File::create(output_path)
        .map_err(|e| AppError::IoError(format!("Failed to create output file: {}", e)))?;

    // Encode with quality
    let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut output, quality);

    img.write_with_encoder(encoder)
        .map_err(|e| AppError::ImageProcessingError(format!("JPEG encoding failed: {}", e)))?;

    Ok(())
}

/// Optimize an image based on its format
///
/// # Arguments
/// * `input_path` - Path to the input image
/// * `output_path` - Path where optimized image will be saved
/// * `jpeg_quality` - Quality for JPEG optimization (1-100, default: 85)
///
/// # Returns
/// * `Ok(())` if optimization was successful
/// * `Err(AppError)` if optimization failed or format is unsupported
pub fn optimize_image(
    input_path: &Path,
    output_path: &Path,
    jpeg_quality: u8,
) -> Result<(), AppError> {
    // Detect image format
    let format = image::ImageFormat::from_path(input_path)
        .map_err(|e| AppError::UnsupportedFormat(format!("Cannot detect image format: {}", e)))?;

    match format {
        ImageFormat::Png => optimize_png(input_path, output_path),
        ImageFormat::Jpeg => optimize_jpeg(input_path, output_path, jpeg_quality),
        // For other formats, just copy the file without optimization
        _ => {
            fs::copy(input_path, output_path)
                .map_err(|e| AppError::IoError(format!("Failed to copy image: {}", e)))?;
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn create_test_png(name: &str) -> PathBuf {
        use image::{ImageBuffer, Rgb};

        let img = ImageBuffer::from_fn(100, 100, |x, y| {
            if (x + y) % 2 == 0 {
                Rgb([255u8, 0u8, 0u8])
            } else {
                Rgb([0u8, 255u8, 0u8])
            }
        });

        let temp_dir = std::env::temp_dir();
        let path = temp_dir.join(name);
        img.save(&path).unwrap();
        path
    }

    #[test]
    fn test_optimize_png() {
        let input = create_test_png("test_optimize_png_input.png");
        let temp_dir = std::env::temp_dir();
        let output = temp_dir.join("test_optimize_png_output.png");

        let result = optimize_png(&input, &output);
        assert!(result.is_ok(), "PNG optimization failed: {:?}", result);
        assert!(output.exists(), "Optimized PNG file was not created");

        // Optimized file should be smaller or equal in size
        if let (Ok(input_meta), Ok(output_meta)) = (fs::metadata(&input), fs::metadata(&output)) {
            assert!(output_meta.len() <= input_meta.len(), "Optimized file is larger than original");
        }

        // Cleanup
        fs::remove_file(input).ok();
        fs::remove_file(output).ok();
    }

    #[test]
    fn test_jpeg_quality_clamping() {
        // Test that quality is clamped to valid range
        let input = create_test_png("test_jpeg_input.png");
        let temp_dir = std::env::temp_dir();
        let output = temp_dir.join("test_jpeg_output.jpg");

        // Should not panic with out-of-range quality
        let result = optimize_jpeg(&input, &output, 150);
        assert!(result.is_ok(), "JPEG optimization failed: {:?}", result);

        // Cleanup
        fs::remove_file(input).ok();
        fs::remove_file(output).ok();
    }
}
