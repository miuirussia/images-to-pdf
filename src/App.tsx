import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

function App() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            <CardTitle>Setup Complete</CardTitle>
            <CardDescription>
              Tauri + React + TypeScript + Tailwind v4 + shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ЭТАП 1: ✅ Tauri project initialized
              <br />
              ЭТАП 2: ✅ Tailwind v4 + shadcn/ui configured
              <br />
              <br />
              Theme switching works! Click the button above to test.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
