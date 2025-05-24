import React, { useState, useMemo } from 'react';
import { useNostrEvents, useProfile } from "nostr-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NIP05 from '@/components/nip05';
import { RecentFollowerCard } from './RecentFollowerCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    nip19,
} from "nostr-tools";
import { RecentZapsCard } from './RecentZapsCard';
import { 
    Users, Zap, Activity, TrendingUp, Calendar, CircleUser, 
    MessageCircle, Share2, ThumbsUp, 
    Network, LineChart, BarChart4, PieChart, Medal, Trophy, 
    Heart, Gift, Sparkles 
} from "lucide-react";
import Link from "next/link";

interface ProfileInfoCardProps {
    pubkey: string;
}

interface ZapStat {
    totalReceived: number;
    count: number;
    topZappers: {pubkey: string; amount: number}[];
}

interface FollowStat {
    totalFollowers: number;
    totalFollowing: number;
    recentFollowers: any[];
    mutualFollows: number;
}

interface NostrActivityStat {
    totalPosts: number;
    totalReplies: number;
    totalReactions: number;
    mostActiveMonth: string;
    postsPerDay: number;
}

const NostrInsights: React.FC<ProfileInfoCardProps> = ({ pubkey }) => {
    const { data: userData, isLoading: userDataLoading } = useProfile({
        pubkey,
    });

    // Fetch followers (kind 3 events that include the user's pubkey)
    const { events: followerEvents, isLoading: followersLoading } = useNostrEvents({
        filter: {
            kinds: [3],
            '#p': [pubkey],
        },
    });

    // Fetch user's follow list (kind 3 events authored by the user)
    const { events: followingEvents, isLoading: followingLoading } = useNostrEvents({
        filter: {
            kinds: [3],
            authors: [pubkey],
        },
    });

    // Fetch zaps (kind 9735 - zap receipts)
    const { events: zapEvents, isLoading: zapsLoading } = useNostrEvents({
        filter: {
            kinds: [9735],
            '#p': [pubkey],
            limit: 100,
        },
    });

    // Fetch user's posts (kind 1 - text notes)
    const { events: postEvents, isLoading: postsLoading } = useNostrEvents({
        filter: {
            kinds: [1],
            authors: [pubkey],
            limit: 200,
        },
    });

    // Fetch reactions to user's posts (kind 7 - reactions)
    const { events: reactionEvents, isLoading: reactionsLoading } = useNostrEvents({
        filter: {
            kinds: [7],
            '#p': [pubkey],
            limit: 100,
        },
    });

    // Calculate follower stats
    const followerStats: FollowStat = useMemo(() => {
        if (followersLoading || followingLoading) {
            return {
                totalFollowers: 0,
                totalFollowing: 0,
                recentFollowers: [],
                mutualFollows: 0
            };
        }

        // Get all pubkeys the user is following
        const followingPubkeys = followingEvents.length > 0 
            ? followingEvents[0]?.tags
                .filter(tag => tag[0] === 'p')
                .map(tag => tag[1])
            : [];
        
        // Get all follower pubkeys
        const followerPubkeys = followerEvents.map(event => event.pubkey);
        
        // Find mutual follows (intersection of followingPubkeys and followerPubkeys)
        const mutualFollows = followingPubkeys.filter(pk => followerPubkeys.includes(pk)).length;

        // Filter for only recent followers (latest in a users followers list)
        const filteredFollowers = followerEvents.filter(follower => {
            const lastPTag = follower.tags[follower.tags.length - 1];
            if (lastPTag[0] === "p" && lastPTag[1] === pubkey) {
                return true;
            }
            return false;
        });

        return {
            totalFollowers: followerEvents.length,
            totalFollowing: followingPubkeys.length,
            recentFollowers: filteredFollowers.slice(-5).reverse(),
            mutualFollows
        };
    }, [followerEvents, followingEvents, followersLoading, followingLoading, pubkey]);

    // Calculate zap stats
    const zapStats: ZapStat = useMemo(() => {
        if (zapsLoading) {
            return {
                totalReceived: 0,
                count: 0,
                topZappers: []
            };
        }

        let totalSats = 0;
        const zapperMap = new Map<string, number>();

        zapEvents.forEach(zap => {
            // Extract zap amount from bolt11 tag
            const bolt11Tag = zap.tags.find(tag => tag[0] === 'bolt11');
            if (!bolt11Tag || !bolt11Tag[1]) return;
            
            // Extract zapper pubkey from P tag
            const zapperTag = zap.tags.find(tag => tag[0] === 'P');
            const zapperPubkey = zapperTag ? zapperTag[1] : zap.pubkey;
            
            // Try to extract amount from description tag
            const descriptionTag = zap.tags.find(tag => tag[0] === 'description');
            if (descriptionTag && descriptionTag[1]) {
                try {
                    const zapRequest = JSON.parse(descriptionTag[1]);
                    const amountTag = zapRequest.tags.find((tag: string[]) => tag[0] === 'amount');
                    if (amountTag && amountTag[1]) {
                        const sats = parseInt(amountTag[1], 10) / 1000; // Convert msats to sats
                        totalSats += sats;
                        
                        // Track zapper amounts
                        zapperMap.set(
                            zapperPubkey, 
                            (zapperMap.get(zapperPubkey) || 0) + sats
                        );
                    }
                } catch (e) {
                    // Invalid JSON in description tag
                }
            }
        });

        // Get top zappers
        const topZappers = Array.from(zapperMap.entries())
            .map(([pubkey, amount]) => ({ pubkey, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        return {
            totalReceived: totalSats,
            count: zapEvents.length,
            topZappers
        };
    }, [zapEvents, zapsLoading]);

    // Calculate post activity stats
    const activityStats: NostrActivityStat = useMemo(() => {
        if (postsLoading || reactionsLoading) {
            return {
                totalPosts: 0,
                totalReplies: 0,
                totalReactions: 0,
                mostActiveMonth: '',
                postsPerDay: 0
            };
        }

        // Count replies (posts with e tags)
        const replies = postEvents.filter(post => 
            post.tags.some(tag => tag[0] === 'e')
        );

        // Count reactions received
        const reactionsReceived = reactionEvents.length;

        // Calculate most active month
        const postsByMonth = postEvents.reduce((acc: Record<string, number>, post) => {
            const date = new Date(post.created_at * 1000);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {});

        // Find month with most posts
        let mostActiveMonth = '';
        let maxPosts = 0;
        Object.entries(postsByMonth).forEach(([month, count]) => {
            if (count > maxPosts) {
                mostActiveMonth = month;
                maxPosts = count;
            }
        });

        // Calculate average posts per day (over last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recentPosts = postEvents.filter(post => post.created_at * 1000 > thirtyDaysAgo);
        const postsPerDay = recentPosts.length / 30;

        return {
            totalPosts: postEvents.length,
            totalReplies: replies.length,
            totalReactions: reactionsReceived,
            mostActiveMonth,
            postsPerDay
        };
    }, [postEvents, reactionEvents, postsLoading, reactionsLoading]);

    // Format profile info
    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    let npubShortened = 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
    
    const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
    const description = userData?.about?.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const nip05 = userData?.nip05;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;
    
    const isLoading = userDataLoading || followersLoading || followingLoading || zapsLoading || postsLoading || reactionsLoading;

    // Calculate engagement score (a fun metric based on activity)
    const engagementScore = Math.min(100, Math.round(
        (followerStats.totalFollowers * 2) + 
        (activityStats.totalPosts * 3) + 
        (zapStats.totalReceived * 0.5) + 
        (activityStats.totalReactions * 1.5)
    ) / 10);

    return (
        <>
            <div className='pt-6 px-6'>
                {/* Profile Card */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-row items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={profileImageSrc}
                                    alt="Avatar"
                                    className="rounded-full"
                                />
                                <AvatarFallback>{title.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold">{title}</h1>
                                <NIP05 nip05={nip05?.toString() ?? ''} pubkey={pubkey} />
                                <div className="flex items-center mt-2 space-x-2">
                                    <Medal className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm">Nostr Engagement: {engagementScore}%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for different insights */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="overview">
                            <Activity className="mr-2 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="network">
                            <Network className="mr-2 h-4 w-4" />
                            Network
                        </TabsTrigger>
                        <TabsTrigger value="zaps">
                            <Zap className="mr-2 h-4 w-4" />
                            Zaps
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Engagement Stats */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium flex items-center">
                                        <Activity className="mr-2 h-4 w-4" />
                                        Engagement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Engagement Score</span>
                                            <span className="font-medium">{engagementScore}%</span>
                                        </div>
                                        <Progress value={engagementScore} className="h-2" />
                                        
                                        <div className="pt-4 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center">
                                                    <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                                                    <span>{activityStats.totalPosts} posts</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Share2 className="mr-2 h-4 w-4 text-purple-500" />
                                                    <span>{activityStats.totalReplies} replies</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>{activityStats.totalReactions} reactions</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                                                    <span>{zapStats.count} zaps</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Network Stats */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium flex items-center">
                                        <Users className="mr-2 h-4 w-4" />
                                        Network
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Followers</span>
                                            <span className="font-medium text-lg">{followerStats.totalFollowers}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Following</span>
                                            <span className="font-medium text-lg">{followerStats.totalFollowing}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Mutual Follows</span>
                                            <span className="font-medium text-lg">{followerStats.mutualFollows}</span>
                                        </div>
                                        <div className="pt-2">
                                            <div className="text-xs text-muted-foreground">Follow Ratio</div>
                                            <Progress 
                                                value={
                                                    followerStats.totalFollowing > 0 
                                                        ? Math.min(100, (followerStats.totalFollowers / followerStats.totalFollowing) * 50)
                                                        : 0
                                                } 
                                                className="h-2 mt-1" 
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Zap Stats */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium flex items-center">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Zap Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Total Received</span>
                                            <span className="font-medium text-lg">{zapStats.totalReceived.toLocaleString()} sats</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Zap Count</span>
                                            <span className="font-medium text-lg">{zapStats.count}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Avg. per Zap</span>
                                            <span className="font-medium text-lg">
                                                {zapStats.count > 0 
                                                    ? Math.round(zapStats.totalReceived / zapStats.count).toLocaleString() 
                                                    : 0} sats
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-medium flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Activity Insights
                                </CardTitle>
                                <CardDescription>
                                    Stats based on {activityStats.totalPosts} posts and {activityStats.totalReactions} reactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Most Active Time</div>
                                        <div className="font-semibold text-xl">{activityStats.mostActiveMonth || "No data"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Avg. Posts per Day</div>
                                        <div className="font-semibold text-xl">{activityStats.postsPerDay.toFixed(1)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Engagement Ratio</div>
                                        <div className="font-semibold text-xl">
                                            {activityStats.totalPosts > 0 
                                                ? (activityStats.totalReactions / activityStats.totalPosts).toFixed(1) 
                                                : "0"} reactions/post
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Network Tab */}
                    <TabsContent value="network" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Recent Followers */}
                            <RecentFollowerCard followers={followerStats.recentFollowers} />
                            
                            {/* Network Stats Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-medium flex items-center">
                                        <Network className="mr-2 h-4 w-4" />
                                        Network Metrics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Mutual Follows Ratio</div>
                                            <div className="flex items-center space-x-4">
                                                <div className="w-full">
                                                    <Progress 
                                                        value={
                                                            followerStats.totalFollowing > 0
                                                                ? (followerStats.mutualFollows / followerStats.totalFollowing) * 100
                                                                : 0
                                                        } 
                                                        className="h-2" 
                                                    />
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {followerStats.totalFollowing > 0
                                                        ? Math.round((followerStats.mutualFollows / followerStats.totalFollowing) * 100)
                                                        : 0}%
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {followerStats.mutualFollows} out of {followerStats.totalFollowing} follows are mutual
                                            </div>
                                        </div>

                                        <div className="pt-2 space-y-1">
                                            <div className="text-sm font-medium">Network Stats</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Followers</span>
                                                    <span>{followerStats.totalFollowers}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Following</span>
                                                    <span>{followerStats.totalFollowing}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Ratio</span>
                                                    <span>
                                                        {followerStats.totalFollowing > 0
                                                            ? (followerStats.totalFollowers / followerStats.totalFollowing).toFixed(2)
                                                            : "∞"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Mutuals</span>
                                                    <span>{followerStats.mutualFollows}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Zaps Tab */}
                    <TabsContent value="zaps" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Zap Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-medium flex items-center">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Zap Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="text-center py-4">
                                            <div className="text-3xl font-bold">{zapStats.totalReceived.toLocaleString()}</div>
                                            <div className="text-sm text-muted-foreground">Total Sats Received</div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold">{zapStats.count}</div>
                                                <div className="text-xs text-muted-foreground">Total Zaps</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">
                                                    {zapStats.count > 0 
                                                        ? Math.round(zapStats.totalReceived / zapStats.count).toLocaleString() 
                                                        : 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Avg Sats/Zap</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">
                                                    {zapStats.topZappers.length > 0 
                                                        ? zapStats.topZappers[0].amount.toLocaleString() 
                                                        : 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Largest Zap</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Recent Zaps */}
                            <RecentZapsCard zaps={zapEvents.slice(-5).reverse() ?? []} />
                        </div>

                        {/* Top Zappers */}
                        {zapStats.topZappers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-medium flex items-center">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Top Supporters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {zapStats.topZappers.map((zapper, index) => (
                                            <TopZapperItem 
                                                key={zapper.pubkey} 
                                                pubkey={zapper.pubkey} 
                                                amount={zapper.amount} 
                                                rank={index + 1} 
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

// Component for displaying top zapper
const TopZapperItem: React.FC<{pubkey: string; amount: number; rank: number}> = ({ pubkey, amount, rank }) => {
    const { data: userData } = useProfile({
        pubkey,
    });

    // Format the pubkey for display
    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    let npubShortened = 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
    
    // Get user display name
    const name = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full 
                                ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                                  rank === 2 ? 'bg-gray-100 text-gray-700' : 
                                  rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    <span className="text-xs font-bold">{rank}</span>
                </div>
                <Link href={`/profile/${encoded}`}>
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profileImageSrc} alt={name} />
                            <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{name}</div>
                    </div>
                </Link>
            </div>
            <div className="flex items-center space-x-1">
                <div className="font-semibold">{amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">sats</div>
            </div>
        </div>
    );
};

export default NostrInsights;