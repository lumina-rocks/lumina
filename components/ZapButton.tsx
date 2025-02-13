import { useNostrEvents } from "@/hooks/useNDK"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ReloadIcon } from "@radix-ui/react-icons"
import ZapButtonList from "./ZapButtonList"
import { Input } from "./ui/input"

export default function ZapButton({ event }: { event: any }) {
    const { events, isLoading } = useNostrEvents({
        filter: {
            '#e': [event.id],
            kinds: [9735],
        },
    });

    let sats = 0;
    var lightningPayReq = require('bolt11');
    events.forEach((event) => {
        event.tags.forEach((tag) => {
            if (tag[0] === 'bolt11') {
                let decoded = lightningPayReq.decode(tag[1]);
                sats = sats + decoded.satoshis;
            }
        });
    });

    const handleZap = async (amount: number) => {
        // TODO: Implement zap functionality with NDK
        // This will require integration with a Lightning wallet
        alert('Zap functionality coming soon!');
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline">
                    {isLoading ? (
                        <>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> ⚡️
                        </>
                    ) : (
                        <>
                            {sats} ⚡️
                        </>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Zaps</DrawerTitle>
                    <DrawerDescription>Send some sats!</DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <Button onClick={() => handleZap(50)}>50 sats</Button>
                        <Button onClick={() => handleZap(100)}>100 sats</Button>
                        <Button onClick={() => handleZap(1000)}>1000 sats</Button>
                        <Button onClick={() => handleZap(5000)}>5000 sats</Button>
                        <Button onClick={() => handleZap(10000)}>10000 sats</Button>
                        <Button onClick={() => handleZap(50000)}>50000 sats</Button>
                    </div>
                    <div className="flex items-center mb-4">
                        <Input type="number" placeholder="Enter custom amount" className="mr-2" />
                        <Button onClick={() => handleZap(0)}>Zap</Button>
                    </div>
                </div>
                <hr className="my-4" />
                <ZapButtonList events={events} />
                <DrawerFooter>
                    <DrawerClose asChild>
                        <div>
                            <Button variant="outline">Close</Button>
                        </div>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}