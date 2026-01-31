import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ImageItem } from './ImageItem';
import { useImages, useAppStore } from '@/store/useAppStore';

export function ImageList() {
  const images = useImages();
  const { clearImages } = useAppStore();

  // Don't render if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Изображения ({images.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearImages}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Очистить все
        </Button>
      </div>

      <Separator />

      {/* Image list with scroll */}
      <ScrollArea className="h-[400px] w-full rounded-md border p-2">
        <div className="space-y-2">
          {images.map((image) => (
            <ImageItem key={image.id} image={image} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
