import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { useAppStore, useImageCount } from './store/useAppStore';

function App() {
  const { theme, setTheme } = useTheme();
  const imageCount = useImageCount();
  const { settings, updateSettings } = useAppStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleOrientation = () => {
    updateSettings({
      orientation:
        settings.orientation === 'Portrait' ? 'Landscape' : 'Portrait',
    });
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
                <strong>ЭТАП 4:</strong> ✅ Rust backend ready (validate_images,
                get_image_info, generate_pdf)
                <br />
                <strong>ЭТАП 5:</strong> ✅ Zustand state management
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">Zustand Store Test:</p>
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
                Toggle Orientation (Store Update Test)
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Settings are persisted to localStorage and will survive page
              reloads.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
