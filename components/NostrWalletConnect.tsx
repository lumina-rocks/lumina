"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nwc } from "@getalby/sdk";
import { Loader2, CheckCircle, XCircle, ExternalLink, Copy, Trash2 } from "lucide-react";
import QRCode from "react-qr-code";

const NWC_STORAGE_KEY = "lumina-nwc-connection";

export function NostrWalletConnect() {
  const [connectionUrl, setConnectionUrl] = useState<string>("");
  const [nwcClient, setNwcClient] = useState<nwc.NWCClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  
  // Load saved connection from localStorage on component mount
  useEffect(() => {
    const savedConnection = localStorage.getItem(NWC_STORAGE_KEY);
    if (savedConnection) {
      setConnectionUrl(savedConnection);
      connectWithSavedUrl(savedConnection);
    }
  }, []);
  
  // Connect with a saved connection URL
  const connectWithSavedUrl = async (url: string) => {
    if (!url) return;
    
    try {
      setIsConnecting(true);
      setError(null);
      
      const client = new nwc.NWCClient({
        nostrWalletConnectUrl: url,
      });
      
      // Test the connection by getting wallet info
      const info = await client.getInfo();
      
      setNwcClient(client);
      setWalletInfo(info);
      setIsConnected(true);
      
      // Get balance
      try {
        const balanceInfo = await client.getBalance();
        setBalance(balanceInfo.balance);
      } catch (e) {
        console.error("Error fetching balance:", e);
      }
      
    } catch (e) {
      console.error("NWC connection error:", e);
      setError("Failed to connect to wallet. Please check your connection URL.");
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Connect with a new NWC URL
  const handleConnect = async () => {
    if (!connectionUrl) {
      setError("Please enter a valid NWC connection URL");
      return;
    }
    
    await connectWithSavedUrl(connectionUrl);
    
    // Save to localStorage if connection is successful
    if (isConnected) {
      localStorage.setItem(NWC_STORAGE_KEY, connectionUrl);
    }
  };
  
  // Handle authorizing with a new wallet
  const handleAuthorize = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const client = await nwc.NWCClient.fromAuthorizationUrl(
        "https://my.albyhub.com/apps/new",
        {
          name: "Lumina",
        }
      );
      
      // Get the connection URL for storage
      const newConnectionUrl = client.getNostrWalletConnectUrl();
      setConnectionUrl(newConnectionUrl);
      
      // Test the connection by getting wallet info
      const info = await client.getInfo();
      
      setNwcClient(client);
      setWalletInfo(info);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem(NWC_STORAGE_KEY, newConnectionUrl);
      
      // Get balance
      try {
        const balanceInfo = await client.getBalance();
        setBalance(balanceInfo.balance);
      } catch (e) {
        console.error("Error fetching balance:", e);
      }
      
    } catch (e) {
      console.error("NWC authorization error:", e);
      setError("Failed to authorize with wallet.");
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect wallet
  const handleDisconnect = () => {
    localStorage.removeItem(NWC_STORAGE_KEY);
    setConnectionUrl("");
    setNwcClient(null);
    setWalletInfo(null);
    setIsConnected(false);
    setBalance(null);
  };
  
  // Copy connection URL to clipboard
  const copyConnectionUrl = () => {
    navigator.clipboard.writeText(connectionUrl);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Lightning Wallet</CardTitle>
            <CardDescription>
              Connect your Lightning wallet using Nostr Wallet Connect (NWC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nwc-url">NWC Connection URL</Label>
              <Input
                id="nwc-url"
                placeholder="nostr+walletconnect://..."
                value={connectionUrl}
                onChange={(e) => setConnectionUrl(e.target.value)}
                className="font-mono text-sm"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row gap-3">
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full md:w-auto">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect with URL"
              )}
            </Button>
            <Button onClick={handleAuthorize} disabled={isConnecting} variant="outline" className="w-full md:w-auto">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authorizing...
                </>
              ) : (
                "Connect with Alby Hub"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connected Wallet
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardTitle>
            <CardDescription>
              Your Lightning wallet is connected via Nostr Wallet Connect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Wallet Info</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {walletInfo.alias || "Unknown Wallet"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Balance</h3>
                  <p className="text-sm text-muted-foreground">
                    {balance !== null ? `${balance} sats` : "Not available"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Connection URL</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-mono bg-muted p-2 rounded overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[300px]">
                      {connectionUrl.substring(0, 20)}...
                    </p>
                    <Button variant="ghost" size="icon" onClick={copyConnectionUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleDisconnect} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Connection QR Code</CardTitle>
            <CardDescription>
              Scan this QR code with a compatible wallet to connect
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="p-4 bg-white rounded-lg">
              <QRCode value={connectionUrl} size={200} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}