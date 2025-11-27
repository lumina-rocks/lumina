import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyNIP05 } from '@/lib/nip05';

interface NIP05VerificationProps {
  nip05: string;
  pubkey: string;
}

export function NIP05Verification({ nip05, pubkey }: NIP05VerificationProps) {
  const { data: isVerified, isLoading } = useQuery({
    queryKey: ['nip05-verification', nip05, pubkey],
    queryFn: () => verifyNIP05(nip05, pubkey),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        {nip05}
      </Badge>
    );
  }

  if (isVerified) {
    return (
      <Badge variant="outline" className="gap-1">
        <CheckCircle2 className="h-3 w-3 text-green-500" />
        {nip05}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <XCircle className="h-3 w-3 text-destructive" />
      {nip05}
    </Badge>
  );
}
