import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SettingsForm } from './SettingsForm';

export function SettingsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки PDF</CardTitle>
        <CardDescription>
          Настройте размер страницы, ориентацию и размещение изображений
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsForm />
      </CardContent>
    </Card>
  );
}
