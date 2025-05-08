'use client';

import Head from "next/head";
import { LoginForm } from "@/components/LoginForm";
import { useEffect } from "react";

export default function LoginPage() {

    useEffect(() => {
        document.title = `Login | LUMINA`;
    }, []);

    return (
        <>
            <Head>
                <title>LUMINA.rocks - Login</title>
                <meta name="description" content="Yet another nostr web ui" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/60 px-4 py-2">
                <div className="max-w-md w-full flex flex-col items-center mb-6">
                    <img src="/lumina.png" alt="Lumina Logo" className="h-14 w-14 mb-3 rounded-lg shadow" />
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">Welcome to Lumina</h1>
                    <p className="text-muted-foreground text-center mb-2 max-w-xs">Sign in to your decentralized Nostr account. No email, no phone, just keys.</p>
                    <span className="text-xs text-muted-foreground">Powered by Nostr</span>
                </div>
                <div className="w-full flex justify-center">
                    <LoginForm />
                </div>
            </div>
        </>
    );
}
