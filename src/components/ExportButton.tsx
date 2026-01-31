import { FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { useCanGenerate, useImages, useSettings, useAppStore } from '@/store/useAppStore';
import { selectOutputPath, generatePdf } from '@/lib/tauri';
import { toast } from 'sonner';

export function ExportButton() {
  const canGenerate = useCanGenerate();
  const images = useImages();
  const settings = useSettings();
  const { setIsGenerating, setProgress } = useAppStore();

  const handleExport = async () => {
    // Check if we have images
    if (images.length === 0) {
      toast.error('Нет изображений для экспорта');
      return;
    }

    // Validate custom page size if needed
    if (settings.pageSize === 'Custom') {
      if (!settings.customWidth || !settings.customHeight) {
        toast.error('Укажите ширину и высоту для пользовательского размера');
        return;
      }
    }

    try {
      // Open save dialog
      const outputPath = await selectOutputPath('images.pdf');

      if (!outputPath) {
        // User cancelled
        return;
      }

      // Start generating
      setIsGenerating(true);
      setProgress(0);

      // Simulate progress (in real app, this would be done via channels from Rust)
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 90) {
          clearInterval(progressInterval);
          setProgress(90);
        } else {
          setProgress(currentProgress);
        }
      }, 200);

      // Get image paths
      const imagePaths = images.map((img) => img.path);

      // Generate PDF
      const generationResult = await generatePdf(imagePaths, outputPath, settings);

      clearInterval(progressInterval);
      setProgress(100);

      if (generationResult.success) {
        toast.success('PDF успешно создан', {
          description: outputPath,
        });

        // Keep progress dialog visible for a moment to show 100%
        setTimeout(() => {
          setIsGenerating(false);
        }, 500);
      } else {
        toast.error('Ошибка при создании PDF', {
          description: generationResult.error,
        });
        setIsGenerating(false);
      }
    } catch (error) {
      toast.error('Ошибка при создании PDF', {
        description: String(error),
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleExport}
        disabled={!canGenerate}
        size="lg"
        className="w-full gap-2"
      >
        <FileDown className="w-5 h-5" />
        Создать PDF
      </Button>

      {!canGenerate && images.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Добавьте изображения для создания PDF
        </p>
      )}
    </div>
  );
}
