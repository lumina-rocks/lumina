import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Users, Zap, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export function WelcomeContent() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-6 space-y-6">
      {/* Main Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to LUMINA</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A decentralized social media platform for sharing images, built on the Nostr protocol
        </p>
      </div>

      {/* What is LUMINA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            What is LUMINA?
          </CardTitle>
          <CardDescription>
            Your creative freedom, decentralized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            LUMINA is a social media image platform that puts you in complete control of your content and connections. 
            Share your photos, discover amazing content, and connect with creators from around the world—all without 
            relying on centralized servers or corporations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Social Connection</h3>
              <p className="text-sm text-muted-foreground">Follow creators and build communities</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
              <Zap className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Bitcoin Integration</h3>
              <p className="text-sm text-muted-foreground">Support creators with Lightning Network</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">True Ownership</h3>
              <p className="text-sm text-muted-foreground">Your content, your data, your keys</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What is Nostr Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            What is Nostr?
          </CardTitle>
          <CardDescription>
            The protocol powering LUMINA&apos;s decentralization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Nostr (Notes and Other Stuff Transmitted by Relays) is a simple, open protocol for creating 
            decentralized social networks. Instead of relying on a single company&apos;s servers, Nostr uses 
            a network of relays to distribute your content across the internet.
          </p>
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="font-semibold">Key Benefits:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Censorship Resistant:</strong> No single entity can control or delete your content</li>
              <li>• <strong>Portable Identity:</strong> Your profile and followers work across all Nostr apps</li>
              <li>• <strong>Open Source:</strong> Transparent, community-driven development</li>
              <li>• <strong>Privacy Focused:</strong> You control what data you share and with whom</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Ready to join the decentralized future of social media?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/upload">
              Share Your First Image
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/global">
              Explore Global Feed
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}