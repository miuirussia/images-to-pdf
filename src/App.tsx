import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { ImageUploader } from './components/ImageUploader';
import { ImageList } from './components/ImageList';

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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Image uploader */}
          <ImageUploader />

          {/* Image list */}
          <ImageList />
        </div>
      </main>
    </div>
  );
}

export default App;
