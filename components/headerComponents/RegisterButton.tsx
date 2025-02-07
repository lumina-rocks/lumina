"use client";

import { Button } from "@/components/ui/button";
import React, { useRef } from 'react';
import Link from "next/link";

export default function RegisterButton() {
    return (
        <Link href={"/onboarding"}>
            <Button>Register</Button>
        </Link>
    );
}