import { useEffect, useState } from 'react';
import { relayUrls } from '../layout';

const fetchRelayStatus = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return { url, status: 'Online' };
    } else {
      return { url, status: 'Offline' };
    }
  } catch (error) {
    return { url, status: 'Offline' };
  }
};

const RelaysPage = () => {
  const [relayStatuses, setRelayStatuses] = useState<{ url: string; status: string }[]>([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await Promise.all(relayUrls.map(fetchRelayStatus));
      setRelayStatuses(statuses);
    };

    fetchStatuses();
  }, []);

  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-bold mb-4">Relay Status</h2>
      <ul>
        {relayStatuses.map((relay) => (
          <li key={relay.url}>
            {relay.url}: {relay.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelaysPage;
