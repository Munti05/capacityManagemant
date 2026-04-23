import { Progress } from '@/components/ui/progress';

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center min-w-[140px]">
      <Progress value={value} className="h-3 flex-1 bg-muted [&>div]:bg-primary" />
    </div>
  );
}
