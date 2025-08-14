'use client';

import { useState, useEffect } from 'react';
import { useNostrEvents, dateToUnix } from 'nostr-react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatOverview() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const now = new Date();

  // In a real implementation, this would fetch direct messages (kind 4)
  // from various relays and process them to show conversations
  const { events } = useNostrEvents({
    filter: {
      kinds: [4], // Kind 4 is direct messages in Nostr
      since: dateToUnix(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
    },
  });

  // For demo purposes, let's add some dummy conversations
  useEffect(() => {
    // These would be actual pubkeys in a real implementation
    const dummyConversations = [
      { 
        id: '1',
        pubkey: 'npub1abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqrst', 
        name: 'Alice',
        avatar: '',
        lastMessage: 'Hey, how are you doing?',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        unread: 2
      },
      { 
        id: '2',
        pubkey: 'npub2abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqrst', 
        name: 'Bob',
        avatar: '',
        lastMessage: 'Did you see the new Nostr client everyone is talking about?',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        unread: 0
      },
      { 
        id: '3',
        pubkey: 'npub3abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqrst', 
        name: 'Charlie',
        avatar: '',
        lastMessage: 'Thanks for sharing that article about Bitcoin!',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        unread: 0
      },
      { 
        id: '4',
        pubkey: 'npub4abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqrst', 
        name: 'Diana',
        avatar: '',
        lastMessage: 'Check out this cool zap feature I just discovered!',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        unread: 1
      },
      { 
        id: '5',
        pubkey: 'npub5abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqrst', 
        name: 'Evan',
        avatar: '',
        lastMessage: 'When are you planning to start your Nostr relay?',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        unread: 0
      },
    ];
    
    setConversations(dummyConversations);
  }, []);

  const filteredConversations = conversations.filter(convo => 
    convo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToChat = (pubkey: string) => {
    // Convert npub to hex format if needed
    let hexPubkey = pubkey;
    if (pubkey.startsWith('npub')) {
      try {
        // This would actually convert using nostr-tools in real implementation
        // For demo, we'll just use the pubkey as is
        hexPubkey = pubkey;
      } catch (e) {
        console.error('Failed to convert pubkey', e);
      }
    }
    
    router.push(`/chat/${hexPubkey}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => (
              <div 
                key={convo.id}
                className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => navigateToChat(convo.pubkey)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={convo.avatar} alt={convo.name} />
                  <AvatarFallback>{convo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{convo.name}</h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {new Date(convo.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                
                {convo.unread > 0 && (
                  <div className="ml-3 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {convo.unread}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No conversations found</p>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-4">
        <Button className="w-full" onClick={() => {/* Would open new message dialog */}}>
          New Message
        </Button>
      </div>
    </div>
  );
}