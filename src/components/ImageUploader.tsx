import { useState, useEffect } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useAppStore } from '@/store/useAppStore';
import { selectImages, validateImages, getImageInfo, getImageThumbnail } from '@/lib/tauri';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addImages, updateImageInfo, updateImageThumbnail } = useAppStore();

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

        // Fetch metadata and thumbnail for each valid image
        for (const path of validation.valid) {
          try {
            // Get image info
            const info = await getImageInfo(path);
            updateImageInfo(path, info);

            // Get thumbnail
            const thumbnail = await getImageThumbnail(path, 96);
            updateImageThumbnail(path, thumbnail);
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

  // Setup Tauri file drop listener
  useEffect(() => {
    const appWindow = getCurrentWindow();

    const unlisten = appWindow.onDragDropEvent((event) => {
      if (event.payload.type === 'over') {
        setIsDragging(true);
      } else if (event.payload.type === 'drop') {
        setIsDragging(false);
        const paths = event.payload.paths;
        if (paths && paths.length > 0) {
          processImages(paths);
        }
      } else if (event.payload.type === 'leave') {
        setIsDragging(false);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent default drag behavior on the card
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
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
