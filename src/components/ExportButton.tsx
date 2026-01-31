import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useCanGenerate, useImages, useSettings, useAppStore } from '@/store/useAppStore';
import { selectOutputPath, generatePdf } from '@/lib/tauri';

export function ExportButton() {
  const canGenerate = useCanGenerate();
  const images = useImages();
  const settings = useSettings();
  const { setIsGenerating, setProgress } = useAppStore();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleExport = async () => {
    setResult(null);

    // Check if we have images
    if (images.length === 0) {
      setResult({
        success: false,
        message: 'Нет изображений для экспорта',
      });
      return;
    }

    // Validate custom page size if needed
    if (settings.pageSize === 'Custom') {
      if (!settings.customWidth || !settings.customHeight) {
        setResult({
          success: false,
          message: 'Укажите ширину и высоту для пользовательского размера',
        });
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
        setResult({
          success: true,
          message: `PDF успешно создан: ${outputPath}`,
        });

        // Keep progress dialog visible for a moment to show 100%
        setTimeout(() => {
          setIsGenerating(false);
        }, 500);
      } else {
        setResult({
          success: false,
          message: `Ошибка при создании PDF: ${generationResult.error}`,
        });
        setIsGenerating(false);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Ошибка: ${error}`,
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

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <AlertDescription className="text-sm">
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
