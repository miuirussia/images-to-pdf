use crate::error::{AppError, Result};
use crate::utils::validation::validate_image;
use crate::utils::optimize::optimize_image;
use lopdf::{content::Content, dictionary, Document, Object, Stream};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

// ============================================================================
// Types (must match TypeScript types exactly)
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PageSize {
    A4,
    A3,
    A5,
    Letter,
    Legal,
    Custom,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Orientation {
    Portrait,
    Landscape,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum FitMode {
    Fit,
    Fill,
    Original,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfSettings {
    pub page_size: PageSize,
    pub custom_width: Option<f32>,
    pub custom_height: Option<f32>,
    pub orientation: Orientation,
    pub fit_mode: FitMode,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerationResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub error: Option<String>,
}

// ============================================================================
// Page Dimensions (in points: 1 point = 1/72 inch)
// ============================================================================

/// Get page dimensions in points based on page size and orientation
fn get_page_dimensions(settings: &PdfSettings) -> Result<(f32, f32)> {
    // Standard sizes in points
    let (mut width, mut height) = match settings.page_size {
        PageSize::A4 => (595.0, 842.0),        // 210mm x 297mm
        PageSize::A3 => (842.0, 1191.0),       // 297mm x 420mm
        PageSize::A5 => (420.0, 595.0),        // 148mm x 210mm
        PageSize::Letter => (612.0, 792.0),    // 8.5" x 11"
        PageSize::Legal => (612.0, 1008.0),    // 8.5" x 14"
        PageSize::Custom => {
            let w = settings
                .custom_width
                .ok_or(AppError::InvalidDimensions)?;
            let h = settings
                .custom_height
                .ok_or(AppError::InvalidDimensions)?;

            if w <= 0.0 || h <= 0.0 {
                return Err(AppError::InvalidDimensions);
            }

            // Convert mm to points (1 mm = 2.83465 points)
            (w * 2.83465, h * 2.83465)
        }
    };

    // Swap dimensions for landscape
    if matches!(settings.orientation, Orientation::Landscape) {
        std::mem::swap(&mut width, &mut height);
    }

    Ok((width, height))
}

// ============================================================================
// Image Placement Calculation
// ============================================================================

struct ImagePlacement {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
}

/// Calculate image position and dimensions based on fit mode
fn calculate_image_placement(
    img_width: u32,
    img_height: u32,
    page_width: f32,
    page_height: f32,
    fit_mode: &FitMode,
) -> ImagePlacement {
    let img_width_f = img_width as f32;
    let img_height_f = img_height as f32;

    match fit_mode {
        FitMode::Fit => {
            // Fit image to page preserving aspect ratio
            let scale_w = page_width / img_width_f;
            let scale_h = page_height / img_height_f;
            let scale = scale_w.min(scale_h);

            let width = img_width_f * scale;
            let height = img_height_f * scale;

            // Center the image
            let x = (page_width - width) / 2.0;
            let y = (page_height - height) / 2.0;

            ImagePlacement { x, y, width, height }
        }

        FitMode::Fill => {
            // Fill page, may crop image
            let scale_w = page_width / img_width_f;
            let scale_h = page_height / img_height_f;
            let scale = scale_w.max(scale_h);

            let width = img_width_f * scale;
            let height = img_height_f * scale;

            // Center the image
            let x = (page_width - width) / 2.0;
            let y = (page_height - height) / 2.0;

            ImagePlacement { x, y, width, height }
        }

        FitMode::Original => {
            // Use original size, centered
            let x = (page_width - img_width_f) / 2.0;
            let y = (page_height - img_height_f) / 2.0;

            ImagePlacement {
                x,
                y,
                width: img_width_f,
                height: img_height_f,
            }
        }
    }
}

// ============================================================================
// Image Optimization Helper
// ============================================================================

/// Create optimized version of an image in a temporary file
///
/// Returns Some(temp_path) if optimization was successful, None if not needed
fn create_optimized_image(input_path: &Path) -> Result<Option<PathBuf>> {
    // Check if the image format supports optimization
    let format = image::ImageFormat::from_path(input_path).ok();

    match format {
        Some(image::ImageFormat::Png) | Some(image::ImageFormat::Jpeg) => {
            // Create temporary file
            let temp_dir = std::env::temp_dir();
            let file_name = input_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("temp");
            let temp_path = temp_dir.join(format!("optimized_{}", file_name));

            // Optimize image (quality 85 for JPEG)
            optimize_image(input_path, &temp_path, 85)?;

            Ok(Some(temp_path))
        }
        _ => {
            // For other formats, don't optimize
            Ok(None)
        }
    }
}

// ============================================================================
// PDF Generation
// ============================================================================

/// Generate PDF from images
#[tauri::command]
pub fn generate_pdf(
    image_paths: Vec<String>,
    output_path: String,
    settings: PdfSettings,
) -> GenerationResult {
    match generate_pdf_internal(image_paths, output_path.clone(), settings) {
        Ok(_) => GenerationResult {
            success: true,
            output_path: Some(output_path),
            error: None,
        },
        Err(e) => GenerationResult {
            success: false,
            output_path: None,
            error: Some(e.to_string()),
        },
    }
}

fn generate_pdf_internal(
    image_paths: Vec<String>,
    output_path: String,
    settings: PdfSettings,
) -> Result<()> {
    if image_paths.is_empty() {
        return Err(AppError::NoImages);
    }

    // Get page dimensions
    let (page_width, page_height) = get_page_dimensions(&settings)?;

    // Create new PDF document
    let mut doc = Document::with_version("1.5");

    let pages_id = doc.new_object_id();
    let catalog_id = doc.add_object(dictionary! {
        "Type" => "Catalog",
        "Pages" => pages_id,
    });
    doc.trailer.set("Root", catalog_id);
    let mut page_ids = Vec::new();

    // Process each image and create pages
    for image_path in &image_paths {
        let page_id = add_image_page(
            &mut doc,
            image_path,
            page_width,
            page_height,
            &settings.fit_mode,
        )?;
        page_ids.push(page_id);
    }

    // Create pages dictionary
    let pages_dict = dictionary! {
        "Type" => "Pages",
        "Count" => page_ids.len() as u32,
        "Kids" => page_ids.iter().map(|&id| Object::Reference(id)).collect::<Vec<_>>(),
    };

    doc.objects.insert(pages_id, Object::Dictionary(pages_dict));

    // Save PDF
    doc.save(&output_path)
        .map_err(|e| AppError::PdfGenerationError(format!("Failed to save PDF: {}", e)))?;

    Ok(())
}

/// Add a single image as a page to the PDF
fn add_image_page(
    doc: &mut Document,
    image_path: &str,
    page_width: f32,
    page_height: f32,
    fit_mode: &FitMode,
) -> Result<(u32, u16)> {
    // Validate image
    validate_image(image_path)?;

    // Optimize image before adding to PDF
    let input_path = Path::new(image_path);
    let optimized_path = create_optimized_image(input_path)?;

    // Use optimized image for PDF
    let image_to_use = optimized_path.as_deref().unwrap_or(input_path);

    // Load image
    let img = image::open(image_to_use)?;
    let img_width = img.width();
    let img_height = img.height();

    // Convert to RGB8
    let img_rgb = img.to_rgb8();
    let raw_data = img_rgb.into_raw();

    // Cleanup temporary file if it was created
    if let Some(temp_path) = optimized_path {
        std::fs::remove_file(temp_path).ok(); // Ignore cleanup errors
    }

    // Calculate placement
    let placement = calculate_image_placement(
        img_width,
        img_height,
        page_width,
        page_height,
        fit_mode,
    );

    // Create image XObject
    let image_id = doc.add_object(Stream::new(
        dictionary! {
            "Type" => "XObject",
            "Subtype" => "Image",
            "Width" => img_width,
            "Height" => img_height,
            "ColorSpace" => "DeviceRGB",
            "BitsPerComponent" => 8,
            "Length" => raw_data.len() as i64,
        },
        raw_data,
    ));

    // Create content stream to place the image
    let content = Content {
        operations: vec![
            // Save graphics state
            lopdf::content::Operation::new("q", vec![]),
            // Transform matrix: [a b c d e f]
            // a = width scale, d = height scale, e = x position, f = y position
            lopdf::content::Operation::new(
                "cm",
                vec![
                    placement.width.into(),
                    0.into(),
                    0.into(),
                    placement.height.into(),
                    placement.x.into(),
                    placement.y.into(),
                ],
            ),
            // Draw image
            lopdf::content::Operation::new("Do", vec!["Im1".into()]),
            // Restore graphics state
            lopdf::content::Operation::new("Q", vec![]),
        ],
    };

    let content_data = content.encode()
        .map_err(|e| AppError::PdfGenerationError(format!("Failed to encode content: {}", e)))?;

    let content_id = doc.add_object(Stream::new(
        dictionary! {
            "Length" => content_data.len() as i64,
        },
        content_data,
    ));

    // Get pages reference from catalog
    let catalog = doc.catalog()
        .map_err(|e| AppError::PdfGenerationError(format!("Failed to get catalog: {}", e)))?;
    let pages_ref = catalog.get(b"Pages")
        .map_err(|_| AppError::PdfGenerationError("Failed to get Pages from catalog".to_string()))?
        .clone();

    // Create page
    let page_id = doc.add_object(dictionary! {
        "Type" => "Page",
        "Parent" => pages_ref,
        "MediaBox" => vec![0.into(), 0.into(), page_width.into(), page_height.into()],
        "Contents" => content_id,
        "Resources" => dictionary! {
            "XObject" => dictionary! {
                "Im1" => image_id,
            },
        },
    });

    Ok(page_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_page_dimensions_a4_portrait() {
        let settings = PdfSettings {
            page_size: PageSize::A4,
            custom_width: None,
            custom_height: None,
            orientation: Orientation::Portrait,
            fit_mode: FitMode::Fit,
        };

        let (w, h) = get_page_dimensions(&settings).unwrap();
        assert_eq!(w, 595.0);
        assert_eq!(h, 842.0);
    }

    #[test]
    fn test_get_page_dimensions_a4_landscape() {
        let settings = PdfSettings {
            page_size: PageSize::A4,
            custom_width: None,
            custom_height: None,
            orientation: Orientation::Landscape,
            fit_mode: FitMode::Fit,
        };

        let (w, h) = get_page_dimensions(&settings).unwrap();
        assert_eq!(w, 842.0);
        assert_eq!(h, 595.0);
    }

    #[test]
    fn test_get_page_dimensions_custom() {
        let settings = PdfSettings {
            page_size: PageSize::Custom,
            custom_width: Some(100.0),
            custom_height: Some(200.0),
            orientation: Orientation::Portrait,
            fit_mode: FitMode::Fit,
        };

        let (w, h) = get_page_dimensions(&settings).unwrap();
        assert!((w - 283.465).abs() < 0.01);
        assert!((h - 566.93).abs() < 0.01);
    }
}
