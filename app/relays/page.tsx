"use client";

import { useNostr } from "nostr-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, SignalHigh, Clock, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AddRelaySheet } from "@/components/AddRelaySheet";
import { ManageCustomRelays } from "@/components/ManageCustomRelays";
import { fetchNip65Relays, mergeAndStoreRelays } from "@/utils/nip65Utils";
import { useToast } from "@/components/ui/use-toast";

export default function RelaysPage() {
  const { connectedRelays } = useNostr();
  const [relayStatus, setRelayStatus] = useState<{ [url: string]: 'connected' | 'connecting' | 'disconnected' | 'error' }>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshingNip65, setRefreshingNip65] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = `Relays | LUMINA`;
    
    // Set a loading timeout - if relays don't connect within 10 seconds, show whatever we have
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);
    
    if (connectedRelays) {
      const status: { [url: string]: 'connected' | 'connecting' | 'disconnected' | 'error' } = {};
      
      // Get status of each relay
      connectedRelays.forEach(relay => {
        if (relay.status === 1) {
          status[relay.url] = 'connected';
        } else if (relay.status === 0) {
          status[relay.url] = 'connecting';
        } else {
          status[relay.url] = 'disconnected';
        }
      });
      
      setRelayStatus(status);
      
      // Only stop loading when we have at least one connected relay or after a timeout
      if (Object.values(status).some(s => s === 'connected') || connectedRelays.length === 0) {
        setLoading(false);
      }
    }
    
    return () => clearTimeout(loadingTimeout);
  }, [connectedRelays, refreshKey, loading]);

  // Function to refresh NIP-65 relays for the current user
  const refreshNip65Relays = async () => {
    try {
      setRefreshingNip65(true);
      
      // Get current user's public key from local storage
      const pubkey = localStorage.getItem('pubkey');
      
      if (!pubkey) {
        toast({
          title: "Error refreshing relays",
          description: "You need to be logged in to refresh NIP-65 relays",
          variant: "destructive",
        });
        return;
      }
      
      // Default relays to query for NIP-65 data
      const defaultRelays = [
        "wss://relay.nostr.band",
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.nostr.ch"
      ];
      
      // Fetch NIP-65 relays
      const nip65Relays = await fetchNip65Relays(pubkey, defaultRelays);
      
      if (nip65Relays.length > 0) {
        // Merge with existing relays and store in localStorage
        const mergedRelays = mergeAndStoreRelays(nip65Relays);
        
        toast({
          title: "NIP-65 relays updated",
          description: `Found ${nip65Relays.length} relays in your NIP-65 list. Refresh the page to connect to them.`,
        });
        
        // Refresh page connection status
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: "No NIP-65 relays found",
          description: "We couldn't find any NIP-65 relay preferences for your account",
        });
      }
    } catch (error) {
      console.error("Error refreshing NIP-65 relays:", error);
      toast({
        title: "Error refreshing relays",
        description: "There was an error fetching your relay preferences",
        variant: "destructive",
      });
    } finally {
      setRefreshingNip65(false);
    }
  };

  // Function to get the appropriate status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Function to get the appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-amber-500">Connecting</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500">Disconnected</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return null;
    }
  };

  const handleRelayAdded = () => {
    // Trigger a refresh of the component when a relay is added
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="py-4 px-2 md:py-6 md:px-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl mr-2 font-bold">Relays</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={refreshNip65Relays}
            disabled={refreshingNip65}
          >
            <RefreshCw className={`h-4 w-4 ${refreshingNip65 ? 'animate-spin' : ''}`} />
            {refreshingNip65 ? 'Refreshing NIP-65...' : 'Refresh NIP-65 Relays'}
          </Button>
          <AddRelaySheet onRelayAdded={handleRelayAdded} />
        </div>
      </div>
      
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Connected Relays</CardTitle>
              <CardDescription>Current active relay connections ({Object.keys(relayStatus).length})</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(relayStatus).map(([url, status]) => (
                      <div
                        key={url}
                        className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <div className="overflow-hidden">
                            <p className="font-medium truncate">{url}</p>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Connection Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(relayStatus).map(([url, status]) => (
                <Card key={url} className={`
                  ${status === 'connected' ? 'border-green-500/50' : ''}
                  ${status === 'connecting' ? 'border-amber-500/50' : ''}
                  ${status === 'disconnected' || status === 'error' ? 'border-red-500/50' : ''}
                `}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {getStatusIcon(status)}
                      <span className="truncate" title={url}>
                        {url.replace(/^wss:\/\//, '')}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <SignalHigh className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {status === 'connected' ? 'Ready for events' : 'Not receiving events'}
                        </span>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <ManageCustomRelays />
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>About Nostr Relays</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Relays are servers that receive, store, and forward Nostr events. They act as the infrastructure
              that makes the decentralized social network possible. You can connect to multiple relays to
              increase the reach and resilience of your posts and profile.
            </p>
            <div className="mt-3">
              <h3 className="text-sm font-medium mb-1">NIP-65 Relay Lists</h3>
              <p className="text-xs text-muted-foreground">
                NIP-65 is a Nostr standard that allows users to share their preferred relays. When you log in, 
                LUMINA automatically fetches your relay preferences from the Nostr network and adds them to your 
                connection list. Use the &quot;Refresh NIP-65 Relays&quot; button above to manually update your relay list.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}