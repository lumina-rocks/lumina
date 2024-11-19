"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useProfile } from "nostr-react"
import Link from "next/link"
import { nip19 } from "nostr-tools"

export function AvatarDropdown() {

  let pubkey = window.localStorage.getItem('pubkey');
  let pubkeyEncoded = pubkey ? nip19.npubEncode(pubkey) : pubkey;

  let src = "https://robohash.org/" + (pubkey as string);

  const { data: userData } = useProfile({
    pubkey: pubkey as string,
  });

  if (pubkey !== null) {
    src = userData?.picture || "https://robohash.org/" + pubkey;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <Button variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button> */}
        <Avatar>
          <AvatarImage src={src} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href={`/profile/${pubkeyEncoded}`}>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={`/profile/settings`}>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { window.localStorage.clear(); window.location.href = "/" }}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}