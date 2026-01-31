import { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';
import { formatFileSize } from '@/types';
import type { ImageItem as ImageItemType } from '@/types';

interface ImageItemProps {
  image: ImageItemType;
}

export function ImageItem({ image }: ImageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { removeImage } = useAppStore();

  const handleRemove = () => {
    removeImage(image.id);
  };

  return (
    <Card
      className="relative transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" title={image.name}>
              {image.name}
            </p>

            {image.info ? (
              <p className="text-xs text-muted-foreground">
                {image.info.width} × {image.info.height} •{' '}
                {formatFileSize(image.info.sizeBytes)} •{' '}
                {image.info.format}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Загрузка...</p>
            )}
          </div>

          {/* Delete button (visible on hover) */}
          {isHovered && (
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
