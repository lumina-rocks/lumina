"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryProfile } from "nostr-tools/nip05"
import { nip19 } from "nostr-tools"
import { useState } from 'react';
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from 'next/navigation';

export function Search() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateAndRedirect = async () => {
    setIsLoading(true);

    let value = inputValue.trim();
    value = value.replaceAll('nostr:', '');

    if (value.startsWith('npub')) {
      router.push(`/profile/${value}`);
    } else if (value.startsWith('#')) {
      router.push(`/tag/${value.replaceAll('#', '')}`);
    } else if(value.includes('@')) {
      if(value.startsWith('@')) {
        setInputValue('_' + value);
      }

      let profile = await queryProfile(value);
      if(profile?.pubkey !== undefined) {
        router.push(`/profile/${nip19.npubEncode(profile?.pubkey)}`);
      }
    } else {
      router.push(`/search/${value}`);
    }
    setIsLoading(false);
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      calculateAndRedirect();
    }
  }

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input 
        type="text" 
        placeholder="npub, NIP-05, #tag or anything else" 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" onClick={calculateAndRedirect}>
        {isLoading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
      </Button>
    </div>
  )
}