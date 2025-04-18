"use client";

import { useNostr } from "nostr-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, SignalHigh, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function RelaysPage() {
  const { connectedRelays } = useNostr();
  const [relayStatus, setRelayStatus] = useState<{ [url: string]: 'connected' | 'connecting' | 'disconnected' | 'error' }>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    document.title = `Relays | LUMINA`;
    
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
      setLoading(false);
    }
  }, [connectedRelays]);

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

  return (
    <div className="py-4 px-2 md:py-6 md:px-6">
      <h2 className="text-2xl font-bold mb-4">Nostr Relays</h2>
      
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
              {/* <div className="text-sm text-muted-foreground">
                Active subscriptions: {activeSubscriptions?.length || 0}
              </div> */}
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}