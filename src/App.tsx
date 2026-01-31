import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { ImageUploader } from './components/ImageUploader';
import { ImageList } from './components/ImageList';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportButton } from './components/ExportButton';
import { ProgressDialog } from './components/ProgressDialog';
import { SettingsDialog } from './components/SettingsDialog';

function App() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl lg:text-2xl font-bold">Image to PDF Converter</h1>
          <div className="flex items-center gap-2">
            {/* Settings dialog for mobile */}
            <div className="lg:hidden">
              <SettingsDialog />
            </div>
            {/* Theme toggle */}
            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image upload and list */}
              <div className="lg:col-span-2 space-y-6">
                <ImageUploader />
                <ImageList />

                {/* Mobile only - Export button */}
                <div className="lg:hidden">
                  <ExportButton />
                </div>
              </div>

              {/* Desktop only - Settings and export panel */}
              <div className="hidden lg:block space-y-6">
                <SettingsPanel />
                <ExportButton />
              </div>
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
