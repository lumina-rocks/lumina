'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { nip19 } from "nostr-tools"
import { Label } from "./ui/label"
import { Textarea } from "@/components/ui/textarea"
import { verifyEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils'
import { useNostr, useProfile } from 'nostr-react';
import { signEvent } from '@/utils/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Globe, Image, ImageIcon, BadgeCheck, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileValue } from '@nostr-dev-kit/ndk-hooks';

export function UpdateProfileForm() {
    const { publish } = useNostr();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    let npub = '';
    let pubkey = '';
    let loginType = '';
    let nsec: Uint8Array;

    if (typeof window !== 'undefined') {
        pubkey = window.localStorage.getItem("pubkey") ?? '';
        const nsecHex = window.localStorage.getItem("nsec");
        loginType = window.localStorage.getItem("loginType") ?? '';

        if (pubkey && pubkey.length > 0) {
            npub = nip19.npubEncode(pubkey);
        }

        if (nsecHex && nsecHex.length > 0) {
            nsec = hexToBytes(nsecHex);
        }
    }
    
    const userData = useProfileValue(pubkey);


    const [username, setUsername] = useState<string | undefined>('');
    const [displayName, setDisplayName] = useState<string | undefined>('');
    const [bio, setBio] = useState<string | undefined>('');
    const [picture, setPicture] = useState<string | undefined>('');
    const [banner, setBanner] = useState<string | undefined>('');
    const [nip05, setNip05] = useState<string | undefined>('');
    const [lud16, setLud16] = useState<string | undefined>('');
    const [website, setWebsite] = useState<string | undefined>('');

    // Update form data when userData changes
    useEffect(() => {
        if (userData && !isDataLoaded) {
            setUsername(userData.name);
            setDisplayName(
                userData.display_name !== undefined && userData.display_name !== null
                    ? String(userData.display_name)
                    : undefined
            );
            setBio(userData.about);
            setPicture(userData.picture);
            setBanner(userData.banner);
            setNip05(userData.nip05);
            setLud16(userData.lud16);
            setWebsite(userData.website);
            setIsDataLoaded(true);
        }
    }, [userData, isDataLoaded]);

    // Field change handlers
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
        setIsSaved(false);
    };

    const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(event.target.value);
        setIsSaved(false);
    };

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBio(event.target.value);
        setIsSaved(false);
    };

    const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPicture(event.target.value);
        setIsSaved(false);
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBanner(event.target.value);
        setIsSaved(false);
    };

    const handleNip05Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNip05(event.target.value);
        setIsSaved(false);
    };

    const handleLud16Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLud16(event.target.value);
        setIsSaved(false);
    };

    const handleWebsiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWebsite(event.target.value);
        setIsSaved(false);
    };

    async function handleProfileUpdate() {
        setIsSubmitting(true);
        setIsSaved(false);

        if (loginType) {
            try {
                let event = {
                    kind: 0,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [],
                    content: JSON.stringify({
                        name: username,
                        display_name: displayName,
                        about: bio,
                        picture: picture,
                        banner: banner,
                        nip05: nip05,
                        lud16: lud16,
                        website: website,
                    }),
                    pubkey: pubkey,
                    id: "",
                    sig: "",
                };

                let signedEvent = await signEvent(loginType, event);

                if (signedEvent === null) {
                    throw new Error('Failed to sign the event');
                }

                let isGood = verifyEvent(signedEvent);

                if (isGood) {
                    publish(signedEvent);
                    setIsSaved(true);
                    setTimeout(() => {
                        window.location.href = `/profile/${npub}`;
                    }, 1000);
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                alert('Failed to update profile. Please check your connection and try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    }

    if (!isDataLoaded) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Card className="border rounded-lg">
                    <CardContent className="p-6 space-y-5">
                        <Skeleton className="h-10 w-full mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                        <Skeleton className="h-32 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border">
                    <AvatarImage src={picture} alt={username || "Profile"} />
                    <AvatarFallback className="text-lg">
                        {username?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-semibold">{displayName || username || "Your Profile"}</h2>
                    <p className="text-sm text-muted-foreground break-all">{nip05 || npub}</p>
                </div>
            </div>

            <Card className="border rounded-lg">
                <CardContent className="p-6 space-y-5">
                    <div>
                        <Label htmlFor="npub" className="text-sm font-medium">Your npub (Public Key)</Label>
                        <Input 
                            id="npub"
                            type="text" 
                            value={npub} 
                            readOnly 
                            className="font-mono text-sm mt-1 bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your public identity on the Nostr network</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                            <Input 
                                id="username" 
                                type="text" 
                                placeholder="e.g., satoshi" 
                                value={username || ""} 
                                onChange={handleUsernameChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Your unique username on the network</p>
                        </div>
                        
                        <div>
                            <Label htmlFor="displayname" className="text-sm font-medium">Display Name</Label>
                            <Input 
                                id="displayname" 
                                type="text" 
                                placeholder="e.g., Satoshi Nakamoto" 
                                value={displayName || ""} 
                                onChange={handleDisplayNameChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">How your name appears to others</p>
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                        <Textarea 
                            id="bio" 
                            placeholder="Tell the world about yourself..." 
                            rows={5} 
                            value={bio || ""} 
                            onChange={handleBioChange}
                            className="mt-1 resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">A short description about yourself</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label htmlFor="picture" className="text-sm font-medium flex items-center gap-1">
                                <ImageIcon className="h-4 w-4" /> Profile Picture URL
                            </Label>
                            <Input 
                                id="picture" 
                                type="text" 
                                placeholder="https://example.com/your-picture.jpg" 
                                value={picture || ""} 
                                onChange={handlePictureChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">URL to your profile image</p>
                        </div>
                        
                        <div>
                            <Label htmlFor="banner" className="text-sm font-medium flex items-center gap-1">
                                <Image className="h-4 w-4" /> Banner Image URL
                            </Label>
                            <Input 
                                id="banner" 
                                type="text" 
                                placeholder="https://example.com/your-banner.jpg" 
                                value={banner || ""} 
                                onChange={handleBannerChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">URL to your profile banner image</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label htmlFor="nip05" className="text-sm font-medium flex items-center gap-1">
                                <BadgeCheck className="h-4 w-4" /> NIP-05 Identifier
                            </Label>
                            <Input 
                                id="nip05" 
                                type="text" 
                                placeholder="_@example.com" 
                                value={nip05 || ""} 
                                onChange={handleNip05Change}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Your verified Nostr identifier</p>
                        </div>
                        
                        <div>
                            <Label htmlFor="lud16" className="text-sm font-medium flex items-center gap-1">
                                <Zap className="h-4 w-4" /> Lightning Address
                            </Label>
                            <Input 
                                id="lud16" 
                                type="text" 
                                placeholder="you@wallet.com" 
                                value={lud16 || ""} 
                                onChange={handleLud16Change}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Your Lightning address for receiving payments</p>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="website" className="text-sm font-medium flex items-center gap-1">
                            <Globe className="h-4 w-4" /> Website
                        </Label>
                        <Input 
                            id="website" 
                            type="text" 
                            placeholder="https://example.com" 
                            value={website || ""} 
                            onChange={handleWebsiteChange}
                            className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your personal website or social media link</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `/profile/${npub}`}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleProfileUpdate} 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Saving...
                        </>
                    ) : isSaved ? (
                        "Saved!"
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </div>
    )
}