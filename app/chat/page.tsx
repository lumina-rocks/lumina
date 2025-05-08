import { Metadata } from 'next';
import ChatOverview from '@/components/chat/ChatOverview';

export const metadata: Metadata = {
  title: 'Chats | Lumina',
  description: 'Your conversations on Nostr',
};

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <ChatOverview />
    </div>
  );
}