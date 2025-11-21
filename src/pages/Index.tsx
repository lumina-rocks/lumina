import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';

const Index = () => {
  useSeoMeta({
    title: 'Welcome to Your Blank App',
    description: 'A modern Nostr client application built with React, TailwindCSS, and Nostrify.',
  });

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Your Blank App
          </h1>
          <p className="text-xl text-muted-foreground">
            Start building your amazing project here!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
