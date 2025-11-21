import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import NotFound from './NotFound';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      // AI agent should implement profile view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Profile placeholder
            </div>
          </div>
        </Layout>
      );

    case 'note':
      // AI agent should implement note view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Note placeholder
            </div>
          </div>
        </Layout>
      );

    case 'nevent':
      // AI agent should implement event view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Event placeholder
            </div>
          </div>
        </Layout>
      );

    case 'naddr':
      // AI agent should implement addressable event view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Addressable event placeholder
            </div>
          </div>
        </Layout>
      );

    default:
      return <NotFound />;
  }
} 