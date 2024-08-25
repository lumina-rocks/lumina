import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryProfile } from "nostr-tools/nip05"
import { nip19 } from "nostr-tools"
import { useState } from 'react';
import { ReloadIcon } from "@radix-ui/react-icons";
// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';

export function Search() {
  const router = useRouter();

  let [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Neuer Zustand für das Laden

  const calculateAndRedirect = async () => {
    setIsLoading(true);

    inputValue = inputValue.replace('nostr://','');

    if (inputValue.startsWith('npub')) { // npub Search
      // window.location.href = `/profile/${inputValue}`;
      router.push(`/profile/${inputValue}`);
    } else if (inputValue.startsWith('#')) { // Hashtag Search
      // window.location.href = `/tag/${inputValue.replaceAll('#', '')}`;
      router.push(`/tag/${inputValue.replaceAll('#', '')}`);
    } else if(inputValue.includes('@')) { // NIP-05 Search
      // if inputValue starts with @, then add a "_" at the beginning
      if(inputValue.startsWith('@')) {
        setInputValue('_' + inputValue);
      }

      let profile = await queryProfile(inputValue);
      if(profile?.pubkey !== undefined) { // Only redirect if profile is found
        router.push(`/profile/${nip19.npubEncode(profile?.pubkey)}`);
      }
    } else {
      router.push(`/search/${inputValue}`);
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
      {/* <Button type="submit" onClick={calculateAndRedirect}>Search</Button> */}
      <Button type="submit" onClick={calculateAndRedirect}>
        {isLoading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : 'Search'} {/* Spinner-Komponente anzeigen, wenn geladen wird */}
      </Button>
    </div>
  )
}