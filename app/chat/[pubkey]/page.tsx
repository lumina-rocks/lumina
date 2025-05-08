import { Metadata } from 'next';
import ChatInterface from '@/components/chat/ChatInterface';

export const metadata: Metadata = {
  title: 'Chat | Lumina',
  description: 'Direct message chat with a Nostr user',
};

interface ChatPageProps {
  params: {
    pubkey: string;
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { pubkey } = params;
  
  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-8rem)]">
      <ChatInterface pubkey={pubkey} />
    </div>
  );
}