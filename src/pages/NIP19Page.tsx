import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProfileView } from './ProfileView';
import { PictureDetails } from './PictureDetails';
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

  const { type, data } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile': {
      // Extract pubkey from decoded data
      const pubkey = type === 'npub' ? data : data.pubkey;
      
      return (
        <Layout>
          <ProfileView pubkey={pubkey} />
        </Layout>
      );
    }

    case 'note':
      // Handle note1 identifiers (hex event IDs)
      return (
        <Layout>
          <div className="container py-8">
            <PictureDetails eventId={data as string} />
          </div>
        </Layout>
      );

    case 'nevent':
      // Handle nevent1 identifiers (event with metadata)
      return (
        <Layout>
          <div className="container py-8">
            <PictureDetails eventId={(data as { id: string }).id} />
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