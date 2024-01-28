"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { DropdownThemeMode } from "@/components/DropdownThemeMode"

export function Navigation() {

    return (
        <div className="my-5 mx-5">
            <div className="text-right">
                <DropdownThemeMode />
            </div>
        </div>
    )
}
