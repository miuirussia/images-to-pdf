import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ImageItem } from './ImageItem';
import { useImages, useAppStore } from '@/store/useAppStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function ImageList() {
  const images = useImages();
  const { clearImages, reorderImages } = useAppStore();

  // Configure sensors for drag operations
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderImages(oldIndex, newIndex);
    }
  };

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

      {/* Image list with scroll and drag-drop */}
      <ScrollArea className="h-[400px] w-full rounded-md border p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {images.map((image) => (
                <ImageItem key={image.id} image={image} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
