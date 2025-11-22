import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface NIP05VerificationProps {
  nip05: string;
  pubkey: string;
}

async function verifyNIP05(nip05: string, pubkey: string): Promise<boolean> {
  try {
    // Parse the NIP-05 identifier (name@domain.com)
    const [name, domain] = nip05.split('@');
    if (!name || !domain) {
      return false;
    }

    // Fetch the .well-known/nostr.json file
    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    // Check if the pubkey matches
    const verifiedPubkey = data.names?.[name];
    if (!verifiedPubkey) {
      return false;
    }

    // Compare pubkeys
    return verifiedPubkey.toLowerCase() === pubkey.toLowerCase();
  } catch {
    return false;
  }
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
