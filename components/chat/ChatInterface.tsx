'use client';

import { useState, useEffect } from 'react';
import { useNostrEvents, dateToUnix } from 'nostr-react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  pubkey: string;
}

export default function ChatInterface({ pubkey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const now = new Date();

  // Fetch direct messages (kind 4) between the current user and the specified pubkey
  const { events } = useNostrEvents({
    filter: {
      kinds: [4], // Kind 4 is direct messages in Nostr
      authors: [/* would be populated with current user pubkey */],
      since: dateToUnix(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
    },
  });

  // For demo purposes, let's add some dummy messages
  useEffect(() => {
    const dummyMessages = [
      { id: '1', sender: 'you', content: 'Hello there!', timestamp: new Date(now.getTime() - 3600000) },
      { id: '2', sender: pubkey, content: 'Hi! How are you?', timestamp: new Date(now.getTime() - 3500000) },
      { id: '3', sender: 'you', content: 'I\'m doing well, thanks for asking!', timestamp: new Date(now.getTime() - 3400000) },
      { id: '4', sender: pubkey, content: 'That\'s great to hear! What have you been up to?', timestamp: new Date(now.getTime() - 3300000) },
      { id: '5', sender: 'you', content: 'Just exploring the Nostr protocol and building some cool stuff with it.', timestamp: new Date(now.getTime() - 3200000) },
      { id: '6', sender: pubkey, content: 'That sounds interesting! I\'ve been hearing a lot about Nostr lately.', timestamp: new Date(now.getTime() - 3100000) },
      { id: '7', sender: 'you', content: 'Yeah, it\'s a fascinating protocol for decentralized social networking. Very simple yet powerful.', timestamp: new Date(now.getTime() - 3000000) },
      { id: '8', sender: pubkey, content: 'I should look into it more. Any resources you recommend?', timestamp: new Date(now.getTime() - 2900000) },
      { id: '9', sender: 'you', content: 'Check out the NIPs (Nostr Implementation Possibilities) on GitHub, and there are several good clients to try out.', timestamp: new Date(now.getTime() - 2800000) },
      { id: '10', sender: pubkey, content: 'Thanks for the tip! I\'ll definitely check those out.', timestamp: new Date(now.getTime() - 2700000) },
    ];
    
    setMessages(dummyMessages);
  }, [pubkey]);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    // In a real implementation, this would publish to Nostr
    const newMessage = {
      id: Date.now().toString(),
      sender: 'you',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden">
      <ChatHeader pubkey={pubkey} />
      <MessageList messages={messages} currentUserPubkey="you" />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}