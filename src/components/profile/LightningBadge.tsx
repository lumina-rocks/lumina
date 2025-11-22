import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface LightningBadgeProps {
  lud06?: string;
  lud16?: string;
}

export function LightningBadge({ lud06, lud16 }: LightningBadgeProps) {
  const lightningAddress = lud16 || lud06;

  if (!lightningAddress) {
    return null;
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
      {lightningAddress}
    </Badge>
  );
}
