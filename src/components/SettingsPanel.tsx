import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useSettings, useAppStore } from '@/store/useAppStore';
import type { PageSize, Orientation, FitMode } from '@/types';

export function SettingsPanel() {
  const settings = useSettings();
  const { updateSettings } = useAppStore();

  const handlePageSizeChange = (value: PageSize) => {
    updateSettings({ pageSize: value });
  };

  const handleOrientationChange = (value: Orientation) => {
    updateSettings({ orientation: value });
  };

  const handleFitModeChange = (value: FitMode) => {
    updateSettings({ fitMode: value });
  };

  const handleCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ customWidth: value });
    }
  };

  const handleCustomHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ customHeight: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки PDF</CardTitle>
        <CardDescription>
          Настройте размер страницы, ориентацию и размещение изображений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Page Size */}
        <div className="space-y-2">
          <Label htmlFor="page-size">Размер страницы</Label>
          <Select value={settings.pageSize} onValueChange={handlePageSizeChange}>
            <SelectTrigger id="page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (210 × 297 мм)</SelectItem>
              <SelectItem value="A3">A3 (297 × 420 мм)</SelectItem>
              <SelectItem value="A5">A5 (148 × 210 мм)</SelectItem>
              <SelectItem value="Letter">Letter (8.5 × 11")</SelectItem>
              <SelectItem value="Legal">Legal (8.5 × 14")</SelectItem>
              <SelectItem value="Custom">Пользовательский</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Size (only shown when Custom is selected) */}
        {settings.pageSize === 'Custom' && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Пользовательский размер (мм)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="custom-width" className="text-xs">
                  Ширина
                </Label>
                <Input
                  id="custom-width"
                  type="number"
                  min="1"
                  step="1"
                  value={settings.customWidth || ''}
                  onChange={handleCustomWidthChange}
                  placeholder="210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-height" className="text-xs">
                  Высота
                </Label>
                <Input
                  id="custom-height"
                  type="number"
                  min="1"
                  step="1"
                  value={settings.customHeight || ''}
                  onChange={handleCustomHeightChange}
                  placeholder="297"
                />
              </div>
            </div>
          </div>
        )}

        {/* Orientation */}
        <div className="space-y-3">
          <Label>Ориентация</Label>
          <RadioGroup
            value={settings.orientation}
            onValueChange={handleOrientationChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Portrait" id="portrait" />
              <Label htmlFor="portrait" className="font-normal cursor-pointer">
                Книжная (Portrait)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Landscape" id="landscape" />
              <Label htmlFor="landscape" className="font-normal cursor-pointer">
                Альбомная (Landscape)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Image Placement */}
        <div className="space-y-2">
          <Label htmlFor="fit-mode">Размещение изображения</Label>
          <Select value={settings.fitMode} onValueChange={handleFitModeChange}>
            <SelectTrigger id="fit-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fit">
                <div className="space-y-1">
                  <p className="font-medium">Вписать (Fit)</p>
                  <p className="text-xs text-muted-foreground">
                    Вписать изображение на страницу, сохраняя пропорции
                  </p>
                </div>
              </SelectItem>
              <SelectItem value="Fill">
                <div className="space-y-1">
                  <p className="font-medium">Заполнить (Fill)</p>
                  <p className="text-xs text-muted-foreground">
                    Заполнить всю страницу, возможна обрезка
                  </p>
                </div>
              </SelectItem>
              <SelectItem value="Original">
                <div className="space-y-1">
                  <p className="font-medium">Оригинал (Original)</p>
                  <p className="text-xs text-muted-foreground">
                    Использовать оригинальный размер, по центру
                  </p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
