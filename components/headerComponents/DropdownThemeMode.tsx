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

export function DropdownThemeMode() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("purple-light")}>
          Purple Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("purple-dark")}>
          Purple Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("vintage-light")}>
          Vintage Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("vintage-dark")}>
          Vintage Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("neo-brutalism-light")}>
          Neo Brutalism Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("neo-brutalism-dark")}>
          Neo Brutalism Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("nature-light")}>
          Nature Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("nature-dark")}>
          Nature Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
