'use client';

import { useState, useRef } from 'react';
import { SendHorizonal, PaperclipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without shift for a new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea based on content
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-3 bg-card">
      <div className="flex items-end gap-2">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="rounded-full h-9 w-9 flex-shrink-0"
          aria-label="Attach file"
        >
          <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Type a message..."
            className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[40px] max-h-[150px]"
            rows={1}
          />
        </div>
        
        <Button 
          type="submit" 
          size="icon"
          className="rounded-full h-9 w-9 flex-shrink-0"
          aria-label="Send message"
          disabled={!message.trim()}
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}