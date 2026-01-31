import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { ImageUploader } from './components/ImageUploader';
import { ImageList } from './components/ImageList';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportButton } from './components/ExportButton';
import { ProgressDialog } from './components/ProgressDialog';

function App() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Image to PDF Converter</h1>
          <Button onClick={toggleTheme} variant="outline" size="sm">
            {theme === 'dark' ? '☀️' : '🌙'}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Image upload and list (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <ImageUploader />
              <ImageList />
            </div>

            {/* Right column - Settings and export (1/3 width on desktop) */}
            <div className="space-y-6">
              <SettingsPanel />
              <ExportButton />
            </div>
          </div>
        </div>
      </main>

      {/* Progress Dialog */}
      <ProgressDialog />
    </div>
  );
}

export default App;
