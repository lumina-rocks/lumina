"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Link from "next/link"

interface GitHubButtonProps {
  repoUrl?: string
}

export default function GitHubButton({ repoUrl = "https://github.com/lumina-rocks/lumina" }: GitHubButtonProps) {
  return (
    <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="icon" aria-label="View GitHub Repository">
        <Github className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </Link>
  )
}

