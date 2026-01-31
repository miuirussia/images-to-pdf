import { useState } from 'react';
import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { useAppStore, useImageCount } from './store/useAppStore';
import { selectImages, validateImages, getImageInfo, isTauri } from './lib/tauri';

function App() {
  const { theme, setTheme } = useTheme();
  const imageCount = useImageCount();
  const { settings, updateSettings, addImages } = useAppStore();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleOrientation = () => {
    updateSettings({
      orientation:
        settings.orientation === 'Portrait' ? 'Landscape' : 'Portrait',
    });
  };

  const handleSelectImages = async () => {
    if (!isTauri()) {
      setTestResult('Not running in Tauri environment');
      return;
    }

    setIsLoading(true);
    setTestResult('');

    try {
      // Open file picker
      const paths = await selectImages();

      if (!paths || paths.length === 0) {
        setTestResult('No images selected');
        setIsLoading(false);
        return;
      }

      // Validate images
      const validation = await validateImages(paths);

      if (validation.invalid.length > 0) {
        setTestResult(
          `Validation: ${validation.valid.length} valid, ${validation.invalid.length} invalid`
        );
      }

      // Add valid images to store
      if (validation.valid.length > 0) {
        addImages(validation.valid);

        // Get info for first image as a test
        try {
          const info = await getImageInfo(validation.valid[0]);
          setTestResult(
            `✅ Loaded ${validation.valid.length} images. First image: ${info.width}x${info.height} ${info.format}`
          );
        } catch (err) {
          setTestResult(
            `✅ Loaded ${validation.valid.length} images (info fetch failed: ${err})`
          );
        }
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Image to PDF Converter</h1>
          <Button onClick={toggleTheme} variant="outline" size="sm">
            {theme === 'dark' ? '☀️' : '🌙'} Toggle Theme
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Complete ✅</CardTitle>
            <CardDescription>
              Tauri + React + TypeScript + Tailwind v4 + shadcn/ui + Zustand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground">
                <strong>ЭТАП 1:</strong> ✅ Tauri project initialized
                <br />
                <strong>ЭТАП 2:</strong> ✅ Tailwind v4 + shadcn/ui configured
                <br />
                <strong>ЭТАП 3:</strong> ✅ TypeScript types defined
                <br />
                <strong>ЭТАП 4:</strong> ✅ Rust backend ready (3 commands)
                <br />
                <strong>ЭТАП 5:</strong> ✅ Zustand state management
                <br />
                <strong>ЭТАП 6:</strong> ✅ Tauri API wrappers
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">Zustand Store Status:</p>
              <p className="text-sm">
                Images loaded: <span className="font-mono">{imageCount}</span>
              </p>
              <p className="text-sm">
                Current page size:{' '}
                <span className="font-mono">{settings.pageSize}</span>
              </p>
              <p className="text-sm">
                Orientation:{' '}
                <span className="font-mono">{settings.orientation}</span>
              </p>
              <p className="text-sm">
                Fit mode: <span className="font-mono">{settings.fitMode}</span>
              </p>
              <Button onClick={toggleOrientation} variant="secondary" size="sm">
                Toggle Orientation
              </Button>
            </div>

            <div className="p-4 border-2 border-primary rounded-lg space-y-3">
              <p className="font-semibold">Tauri API Test:</p>
              <p className="text-sm text-muted-foreground">
                Running in Tauri: {isTauri() ? '✅ Yes' : '❌ No'}
              </p>
              <Button
                onClick={handleSelectImages}
                disabled={isLoading || !isTauri()}
                className="w-full"
              >
                {isLoading ? 'Loading...' : 'Select Images (Test API)'}
              </Button>

              {testResult && (
                <Alert>
                  <AlertDescription className="text-sm font-mono">
                    {testResult}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Settings are persisted to localStorage. Click "Select Images" to
              test Rust backend communication.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
