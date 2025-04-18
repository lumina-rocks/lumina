import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RecentZap } from "./RecentZap";

export function RecentZapsCard({ zaps }: { zaps: Array<any> }) {
    const lastFiveZaps = zaps.slice(-5).reverse();

    // Parse all weights, calculate a sum, and then a percentage to each receiver
    const parseWeights = (zaps: Array<any>) => {
        let totalWeight = 0;
        let weights: { [key: string]: number } = {};

        zaps.forEach(zap => {
            zap.tags.forEach(tag => {
                if (tag[0] === 'zap') {
                    const receiver = tag[1];
                    const weight = parseInt(tag[3] || '0', 10);
                    weights[receiver] = (weights[receiver] || 0) + weight;
                    totalWeight += weight;
                }
            });
        });

        let percentages: { [key: string]: number } = {};
        if (totalWeight === 0) {
            return percentages; // Return an empty object if totalWeight is zero
        }
        for (let receiver in weights) {
            percentages[receiver] = (weights[receiver] / totalWeight) * 100;
        }

        return percentages;
    };

    const zapSplitConfig = parseWeights(zaps);

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
                    <div className="mt-4">
                        <h3 className="text-sm font-medium">Zap Split Configuration:</h3>
                        <ul className="text-sm text-muted-foreground">
                            {Object.keys(zapSplitConfig).map(receiver => (
                                <li key={receiver}>{receiver}: {zapSplitConfig[receiver].toFixed(2)}%</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
