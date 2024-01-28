import { Button } from "@/components/ui/button";
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
import { Textarea } from "./ui/textarea";
import { CodeIcon } from "@radix-ui/react-icons";


export default function ViewRawButton(event: any) {
    return (
        <Drawer>
            <DrawerTrigger>
                <Button variant="outline"><CodeIcon /></Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Raw Event</DrawerTitle>
                    <DrawerDescription>This shows the raw event data.</DrawerDescription>
                </DrawerHeader>
                <Textarea rows={20} disabled>{JSON.stringify(event, null, 2)}</Textarea>
                <DrawerFooter>
                    <DrawerClose>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    );
}