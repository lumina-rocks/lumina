'use client';

import { useEffect, useState } from 'react';
import { useProfile } from 'nostr-react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatHeaderProps {
  pubkey: string;
}

export default function ChatHeader({ pubkey }: ChatHeaderProps) {
  const router = useRouter();
  const { data: userData } = useProfile({
    pubkey,
  });
  
  const [displayName, setDisplayName] = useState<string>(pubkey.substring(0, 8) + '...');
  
  useEffect(() => {
    if (userData?.name) {
      setDisplayName(userData.name);
    }
  }, [userData]);

  return (
    <div className="flex items-center p-3 border-b border-border bg-card">
      <button 
        onClick={() => router.back()} 
        className="p-2 rounded-full hover:bg-muted mr-2"
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <Avatar className="h-10 w-10">
        <AvatarImage src={userData?.picture || ''} alt={displayName} />
        <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="ml-3 flex-1 overflow-hidden">
        <h3 className="font-medium text-foreground truncate">{displayName}</h3>
        {userData?.nip05 && (
          <p className="text-xs text-muted-foreground truncate">{userData.nip05}</p>
        )}
      </div>
    </div>
  );
}