'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  currentUserPubkey: string;
}

export default function MessageList({ messages, currentUserPubkey }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUserPubkey;
          
          return (
            <div 
              key={message.id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-2 ${
                  isCurrentUser 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted text-muted-foreground rounded-bl-none'
                }`}
              >
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground/80'}`}>
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}