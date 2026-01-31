import { useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useAppStore } from '@/store/useAppStore';
import { selectImages, validateImages, getImageInfo } from '@/lib/tauri';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addImages, updateImageInfo } = useAppStore();

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const paths = files.map((file) => {
      // In Tauri, we need to use the file path
      // For now, we'll use the file name, but in real Tauri app this will be handled differently
      return (file as any).path || file.name;
    });

    if (paths.length > 0) {
      await processImages(paths);
    }
  };

  // Handle file selection via button
  const handleSelectFiles = async () => {
    try {
      const paths = await selectImages();

      if (!paths || paths.length === 0) {
        return;
      }

      await processImages(paths);
    } catch (err) {
      toast.error('Ошибка при выборе файлов', {
        description: String(err),
      });
    }
  };

  // Process selected images
  const processImages = async (paths: string[]) => {
    setIsLoading(true);

    try {
      // Validate images
      const validation = await validateImages(paths);

      // Show errors for invalid files
      if (validation.invalid.length > 0) {
        validation.invalid.forEach((inv) => {
          const fileName = inv.path.split('/').pop() || inv.path;
          toast.error('Невалидный файл', {
            description: `${fileName}: ${inv.error}`,
          });
        });
      }

      // Add valid images to store
      if (validation.valid.length > 0) {
        addImages(validation.valid);

        // Fetch metadata for each valid image
        for (const path of validation.valid) {
          try {
            const info = await getImageInfo(path);
            // Find the image by path and update its info
            updateImageInfo(path, info);
          } catch (err) {
            console.error(`Failed to get info for ${path}:`, err);
          }
        }

        // Show success message
        toast.success('Изображения загружены', {
          description: `Добавлено: ${validation.valid.length}`,
        });
      }
    } catch (err) {
      toast.error('Ошибка при обработке изображений', {
        description: String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div
            className={cn(
              'p-4 rounded-full bg-muted transition-colors',
              isDragging && 'bg-primary/10'
            )}
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">
              {isDragging
                ? 'Отпустите файлы здесь'
                : 'Перетащите изображения сюда'}
            </p>
            <p className="text-sm text-muted-foreground">
              или используйте кнопку ниже
            </p>
            <p className="text-xs text-muted-foreground">
              Поддерживаемые форматы: PNG, JPG, JPEG, WEBP, BMP, GIF, TIFF
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSelectFiles}
              disabled={isLoading}
              className="gap-2"
            >
              <FileImage className="w-4 h-4" />
              {isLoading ? 'Загрузка...' : 'Выбрать файлы'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
