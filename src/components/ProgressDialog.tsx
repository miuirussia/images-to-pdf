import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Progress } from './ui/progress';
import { useIsGenerating, useProgress } from '@/store/useAppStore';

export function ProgressDialog() {
  const isGenerating = useIsGenerating();
  const progress = useProgress();

  return (
    <Dialog open={isGenerating}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Генерация PDF</DialogTitle>
          <DialogDescription>
            Пожалуйста, подождите. Это может занять некоторое время...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {progress}%
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
