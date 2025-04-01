"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useNostr, useNostrEvents } from "nostr-react"
import type { NostrEvent } from "nostr-tools"
import { ReloadIcon } from "@radix-ui/react-icons"
import { signEvent } from "@/utils/utils"
import { AlignVerticalJustifyCenter } from "lucide-react"

interface FollowButtonProps {
  pubkey: string
  userPubkey: string
}

const FollowButton: React.FC<FollowButtonProps> = ({ pubkey, userPubkey }) => {
  const { publish } = useNostr()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const loginType = typeof window !== "undefined" ? window.localStorage.getItem("loginType") : null

  const { events, isLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [userPubkey],
      limit: 1,
    },
  })

  // Extract following pubkeys from events (tag with p)
//   let followingPubkeys = events.flatMap((event) => event.tags.map((tag) => tag[1])).filter(Boolean) // Filter out null or undefined
  let followingPubkeys = events.flatMap((event) => event.tags.filter((tag) => tag[0] === "p").map((tag) => tag[1])) // Filter out null or undefined

  // Only update the following state from server data when not in the middle of an update
  // and when the component first loads or receives new server data
  useEffect(() => {
    if (!isUpdating) {
      setIsFollowing(followingPubkeys.includes(pubkey))
    }
  }, [followingPubkeys, pubkey, isUpdating])

  const handleFollow = async () => {
    if (!userPubkey || isUpdating) return

    // Set updating state to prevent useEffect from overriding our optimistic update
    setIsUpdating(true)

    // Optimistically update UI immediately
    const newFollowingState = !isFollowing
    setIsFollowing(newFollowingState)

    try {
      // Get a unique set of pubkeys to follow
      const uniqueFollows = new Set(followingPubkeys)

      // Add or remove the target pubkey based on the new state
      if (newFollowingState) {
        uniqueFollows.add(pubkey)
      } else {
        uniqueFollows.delete(pubkey)
      }

      // Convert to array and create properly formatted p tags
      const formattedTags = Array.from(uniqueFollows).map((pk) => ["p", pk])

      const eventTemplate = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags: formattedTags,
        content: "",
        pubkey: "", // Placeholder
        id: "", // Placeholder
        sig: "", // Placeholder
      }

      // Sign and publish the event
      const signedEvent = (await signEvent(loginType, eventTemplate)) as NostrEvent

      if (signedEvent) {
        publish(signedEvent)
      } else {
        // If signing fails, revert the optimistic update
        setIsFollowing(!newFollowingState)
      }
    } catch (error) {
      console.error("Error updating follow status:", error)
      // Revert optimistic update on error
      setIsFollowing(!newFollowingState)
    } finally {
      // Allow server updates to affect state again after a short delay
      // This ensures our optimistic update isn't immediately overridden
      setTimeout(() => {
        setIsUpdating(false)
      }, 1000)
    }
  }

  return (
    <Button
      className="w-full"
      onClick={handleFollow}
      disabled={isLoading || !userPubkey || isUpdating}
      variant={isFollowing ? "outline" : "default"}
    >
      {isLoading ? (
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      ) : isUpdating ? (
        <>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          {isFollowing ? "Unfollow" : "Follow"}
        </>
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  )
}

export default FollowButton

