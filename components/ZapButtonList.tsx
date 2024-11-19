import { ScrollArea } from "@/components/ui/scroll-area"
import ZapButtonListItem from "./ZapButtonListItem";

export default function ZapButtonList({ events }: { events: any }) {
    return (
        <ScrollArea className="px-4 h-[50vh]">
            {events.map((event: any) => (
                <ZapButtonListItem key={event.id} event={event} />
            ))}
        </ScrollArea>
    );
}