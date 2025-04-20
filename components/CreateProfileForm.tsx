'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { nip19 } from "nostr-tools"
import { Label } from "./ui/label"
import { Textarea } from "@/components/ui/textarea"
import { verifyEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils'
import { useNostr, useProfile } from 'nostr-react';
import { signEvent } from '@/utils/utils';
import { 
    Card, 
    CardContent,
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, User, AtSign, FileImage, Info, Loader2 } from 'lucide-react';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger 
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateProfileForm() {
    const { publish } = useNostr();

    // Local state for form inputs
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [picture, setPicture] = useState("");
    const [website, setWebsite] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    // Get user info from local storage
    const [npub, setNpub] = useState('');
    const [pubkey, setPubkey] = useState('');
    const [loginType, setLoginType] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPubkey = window.localStorage.getItem("pubkey") ?? '';
            const storedLoginType = window.localStorage.getItem("loginType") ?? '';
            
            setPubkey(storedPubkey);
            setLoginType(storedLoginType);

            if (storedPubkey && storedPubkey.length > 0) {
                setNpub(nip19.npubEncode(storedPubkey));
            }
        }
    }, []);

    // Try to load existing profile data if available
    const { data: userData, isLoading: profileLoading } = useProfile({
        pubkey,
    });

    useEffect(() => {
        if (userData) {
            setUsername(userData.name || "");
            setDisplayName(userData.display_name || "");
            setBio(userData.about || "");
            setPicture(userData.picture || "");
            setWebsite(userData.website || "");
        }
    }, [userData]);

    // Input handlers
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setUsername(value);
        
        // Clear validation error if fixed
        if (validationErrors.username && value.trim()) {
            const newErrors = {...validationErrors};
            delete newErrors.username;
            setValidationErrors(newErrors);
        }
    };

    const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(event.target.value);
    };

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBio(event.target.value);
    };

    const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPicture(event.target.value);
    };

    const handleWebsiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWebsite(event.target.value);
    };

    // Form validation
    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        
        if (!username.trim()) {
            errors.username = "Username is required";
        }
        
        if (picture && !isValidUrl(picture)) {
            errors.picture = "Please enter a valid URL for your profile picture";
        }
        
        if (website && !isValidUrl(website)) {
            errors.website = "Please enter a valid URL for your website";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Form submission
    async function handleProfileUpdate() {
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Create the profile content object
            const profileContent: Record<string, string> = {
                name: username,
                display_name: displayName || username, // Fallback to username if display name is empty
            };
            
            if (bio) profileContent.about = bio;
            if (picture) profileContent.picture = picture;
            if (website) profileContent.website = website;
            
            // Create the event
            const event = {
                kind: 0,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: JSON.stringify(profileContent),
                pubkey: pubkey,
                id: "",
                sig: "",
            };

            // Sign the event
            const signedEvent = await signEvent(loginType, event);

            if (signedEvent === null) {
                throw new Error('Failed to sign the event');
            }

            // Verify the event
            const isGood = verifyEvent(signedEvent);

            alert(`Event verification: ${isGood ? 'Success' : 'Failed'}`);
            alert(JSON.stringify(signedEvent, null, 2));

            if (isGood) {
                // Publish to relays
                publish(signedEvent);
                
                // Redirect to profile page
                window.location.href = `/profile/${npub}`;
            } else {
                throw new Error('Event verification failed');
            }
        } catch (error) {
            setValidationErrors({
                submit: error instanceof Error ? error.message : 'Failed to create profile. Please try again.'
            });
            setIsSubmitting(false);
        }
    }

    // Extract initials for avatar fallback
    const getInitials = () => {
        if (displayName) {
            return displayName.charAt(0).toUpperCase();
        } else if (username) {
            return username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="space-y-8">
            {/* Profile preview card */}
            <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Profile Preview</CardTitle>
                    <CardDescription>
                        How your profile could appear to others
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                        <Avatar className="h-20 w-20 border-2 border-background">
                            <AvatarImage src={picture} alt={displayName || username} />
                            <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1.5 text-center sm:text-left">
                            <h3 className="font-semibold text-lg">
                                {displayName || username || 'Display Name'}
                            </h3>
                            {username && (
                                <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-1">
                                    @{username}
                                </p>
                            )}
                            {bio && (
                                <p className="text-sm pt-1 max-w-sm">
                                    {bio.length > 100 ? `${bio.substring(0, 100)}...` : bio}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile form */}
            <div className="space-y-5">
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="username" className="font-medium">
                            Username
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="w-60">This is your unique username on Nostr</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Input 
                        id="username" 
                        placeholder="e.g., satoshi" 
                        value={username} 
                        onChange={handleUsernameChange} 
                        className={validationErrors.username ? "border-destructive" : ""}
                    />
                    {validationErrors.username && (
                        <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" /> {validationErrors.username}
                        </p>
                    )}
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="displayname" className="font-medium">
                            Display Name
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="w-60">This is the name that will be displayed to others</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Input 
                        id="displayname" 
                        placeholder="e.g., Satoshi Nakamoto" 
                        value={displayName} 
                        onChange={handleDisplayNameChange} 
                    />
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="picture" className="font-medium">
                            Profile Picture URL
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="w-80">Enter a direct link to your profile image (JPEG or PNG)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex">
                        <div className="relative flex-grow">
                            <Input 
                                id="picture" 
                                placeholder="https://example.com/your-image.jpg" 
                                value={picture} 
                                onChange={handlePictureChange} 
                                className={`pl-9 ${validationErrors.picture ? "border-destructive" : ""}`}
                            />
                            <FileImage className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    {validationErrors.picture && (
                        <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" /> {validationErrors.picture}
                        </p>
                    )}
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="website" className="font-medium">
                            Website
                        </Label>
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                    </div>
                    <Input 
                        id="website" 
                        placeholder="https://example.com" 
                        value={website} 
                        onChange={handleWebsiteChange} 
                        className={validationErrors.website ? "border-destructive" : ""}
                    />
                    {validationErrors.website && (
                        <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" /> {validationErrors.website}
                        </p>
                    )}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="bio" className="font-medium">Bio</Label>
                    <Textarea 
                        id="bio" 
                        placeholder="Tell the world about yourself..." 
                        rows={5} 
                        value={bio} 
                        onChange={handleBioChange} 
                        className="resize-none"
                    />
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                            Your Public Key (npub)
                        </Label>
                        <Input 
                            type="text" 
                            value={npub} 
                            readOnly 
                            className="font-mono text-xs bg-muted/30" 
                        />
                    </div>

                    {validationErrors.submit && (
                        <Alert variant="destructive" className="py-2">
                            <AlertDescription className="text-sm">
                                {validationErrors.submit}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full" 
                        onClick={handleProfileUpdate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating profile...
                            </>
                        ) : (
                            "Create My Profile"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}