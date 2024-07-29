import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RecentFollower } from "./RecentFollower";

export function RecentFollowerCard({ followers }: { followers: Array<any> }) {
    const lastFiveFollowers = followers.slice(-5).reverse();
    return (
        <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-normal">Recent Follower 🫂</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='pt-4'>
                    <div className="space-y-8">
                        {lastFiveFollowers.map((follower) => (
                            <RecentFollower follower={follower} key={follower.id}/>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}