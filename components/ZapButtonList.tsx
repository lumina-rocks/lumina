import ZapButtonListItem from "./ZapButtonListItem";
import { NDKEvent } from '@nostr-dev-kit/ndk';

export default function ZapButtonList({ events }: { events: NDKEvent[] }) {
  return (
    <div className="px-4">
      <div className="space-y-4">
        {events.map((event) => (
          <ZapButtonListItem key={event.id} event={event.rawEvent()} />
        ))}
      </div>
    </div>
  );
}