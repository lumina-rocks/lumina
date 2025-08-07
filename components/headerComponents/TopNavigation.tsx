"use client"

import { siteConfig } from "@/config/site"
import { useEffect, useState } from "react"
import { TopNavigationItems } from "./TopNavigationItems"
import { DropdownThemeMode } from "./DropdownThemeMode"
import { AvatarDropdown } from "./AvatarDropdown"
import ConnectedRelaysButton from "@/components/headerComponents/ConnectedRelaysButton"
import AuthButton from "./AuthButton"
import { Button } from "@/components/ui/button"
import { UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TopNavigation() {
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setPubkey(window.localStorage.getItem("pubkey"))
  }, [])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return (
      <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <TopNavigationItems items={siteConfig.mainNav} />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <ConnectedRelaysButton />
              <DropdownThemeMode />
              {/* Placeholder for auth button to prevent layout shift */}
              <Button variant="outline" className="flex items-center gap-2" disabled>
                <UserIcon className="h-[1.2rem] w-[1.2rem]" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <TopNavigationItems items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Badge variant="secondary" className="hidden sm:inline">v{siteConfig.version}</Badge>
            <ConnectedRelaysButton />
            <DropdownThemeMode />
            {pubkey !== null ? <AvatarDropdown /> : <AuthButton />}
          </nav>
        </div>
      </div>
    </header>
  )
}

