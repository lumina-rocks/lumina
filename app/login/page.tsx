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
            <div className="w-screen pt-10 flex items-center justify-center">
                <LoginForm />
            </div>
        </>
    );
}
