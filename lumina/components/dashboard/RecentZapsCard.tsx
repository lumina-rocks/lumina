import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RecentZap } from "./RecentZap";

export function RecentZapsCard({ zaps }: { zaps: Array<any> }) {
    const lastFiveZaps = zaps.slice(-5).reverse();
    return (
        <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-normal">Recent Zaps ⚡️</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='pt-4'>
                    <div className="space-y-8">
                        {lastFiveZaps.map((zap) => (
                            <RecentZap zap={zap} key={zap.id}/>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}