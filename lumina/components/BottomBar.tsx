"use client";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/mwaJmHMv0vd
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { BellIcon, GlobeIcon, HomeIcon, RowsIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { JSX, SVGProps, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter, usePathname } from 'next/navigation'
import { SearchIcon } from "lucide-react";

export default function BottomBar() {

  const router = useRouter();
  const [pubkey, setPubkey] = useState<null | string>(null);

  useEffect(() => {
    return setPubkey(window.localStorage.getItem('pubkey') ?? null);
  }, []);

  const pathname = usePathname();
  const isActive = (path: string, currentPath: string) => currentPath === path ? 'text-purple-500' : '';

  return (
    <nav className="fixed inset-x-0 bottom-0 h-14 flex flex-row shrink-0 items-center justify-between border-t bg-background/90 shadow-up-4 z-50 backdrop-blur">
      <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/', pathname)}`} href="/">
        <HomeIcon className={`h-6 w-6`} />
        <span className="sr-only">Home</span>
      </Link>
      {pubkey && (
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/feed', pathname)}`} href="/feed">
          <RowsIcon className={`h-6 w-6`} />
          <span className="sr-only">Follower Feed</span>
        </Link>
      )}
      <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/global', pathname)}`} href="/global">
        <GlobeIcon className={`h-6 w-6`} />
        <span className="sr-only">Global</span>
      </Link>
      <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/search', pathname)}`} href="/search">
        <SearchIcon className={`h-6 w-6`} />
        <span className="sr-only">Search</span>
      </Link>
      {pubkey && (
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/notifications', pathname)}`} href="/notifications">
          <BellIcon className={`h-6 w-6`} />
          <span className="sr-only">Notifications</span>
        </Link>
      )}
    </nav>
  )
}