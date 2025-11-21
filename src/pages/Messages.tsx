import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { DMMessagingInterface } from '@/components/dm/DMMessagingInterface';

const Messages = () => {
  useSeoMeta({
    title: 'Messages',
    description: 'Private encrypted messaging on Nostr',
  });

  return (
    <Layout>
      <div className="container mx-auto p-4 h-[calc(100vh-10rem)] flex flex-col">
        <DMMessagingInterface className="flex-1" />
      </div>
    </Layout>
  );
};

export default Messages;
