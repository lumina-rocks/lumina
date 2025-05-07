"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "./ui/button"
import { useNostr, useNostrEvents } from "nostr-react"
import type { NostrEvent } from "nostr-tools"
import { ReloadIcon } from "@radix-ui/react-icons"
import { signEvent } from "@/utils/utils"

interface FollowButtonProps {
  pubkey: string
  userPubkey: string
}

const FollowButton: React.FC<FollowButtonProps> = ({ pubkey, userPubkey }) => {
  const { publish } = useNostr()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const loginType = typeof window !== "undefined" ? window.localStorage.getItem("loginType") : null

  // Fetch the user's follow list (kind 3 event)
  const { events, isLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [userPubkey],
      limit: 1,
    },
  })

  // Get the latest follow list event
  const latestFollowList = useMemo(() => {
    if (events.length === 0) return null
    // Sort by created_at to get the most recent
    return [...events].sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0]
  }, [events])

  // Check if the user is following the profile
  useEffect(() => {
    if (!isPending && latestFollowList) {
      const following = latestFollowList.tags
        .filter(tag => tag[0] === "p")
        .some(tag => tag[1] === pubkey)
      setIsFollowing(following)
    }
  }, [latestFollowList, pubkey, isPending])

  const handleFollow = useCallback(async () => {
    if (!userPubkey || isPending || isLoading || !latestFollowList) return

    setIsPending(true)
    // Optimistically update UI
    const newFollowingState = !isFollowing
    setIsFollowing(newFollowingState)

    try {
      // Create a new tags array that maintains the original structure
      let newTags = [...latestFollowList.tags]
      
      if (newFollowingState) {
        // Add to follow list if not already there
        if (!newTags.some(tag => tag[0] === "p" && tag[1] === pubkey)) {
          // // Find the last 'p' tag to preserve ordering
          // const lastPTagIndex = [...newTags].reverse().findIndex(tag => tag[0] === "p")
          
          // if (lastPTagIndex >= 0) {
          //   // Insert after the last 'p' tag (accounting for reverse indexing)
          //   const insertPosition = newTags.length - lastPTagIndex
          //   newTags.splice(insertPosition, 0, ["p", pubkey])
          // } else {
            // No existing 'p' tags, add to the end
          newTags.push(["p", pubkey])
          // }
        }
      } else {
        // Remove from follow list while preserving order
        newTags = newTags.filter(tag => !(tag[0] === "p" && tag[1] === pubkey))
      }

      // Create the follow list event (NIP-02) with preserved tag structure
      const followEvent: NostrEvent = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags: newTags,
        content: latestFollowList.content || "", // Preserve original content
        pubkey: "", // Placeholder, will be set by signEvent
        id: "", // Placeholder, will be set by signEvent
        sig: "", // Placeholder, will be set by signEvent
      }

      // Sign and publish the event
      const signedEvent = await signEvent(loginType, followEvent) as NostrEvent
      
      if (signedEvent) {
        publish(signedEvent)
        // The useEffect will catch the new event
      } else {
        // Revert the optimistic update if signing fails
        setIsFollowing(!newFollowingState)
        console.error("Failed to sign the follow event")
      }
    } catch (error) {
      console.error("Error updating follow status:", error)
      // Revert optimistic update on error
      setIsFollowing(!newFollowingState)
    } finally {
      // Add a short delay before clearing the pending state
      // to prevent race conditions with incoming events
      setTimeout(() => {
        setIsPending(false)
      }, 1500)
    }
  }, [userPubkey, isPending, isLoading, isFollowing, latestFollowList, pubkey, loginType, publish])

  // Determine the button text based on current state
  const buttonText = useMemo(() => {
    if (isLoading) return "Loading..."
    if (isPending) return isFollowing ? "Unfollowing..." : "Following..."
    return isFollowing ? "Unfollow" : "Follow"
  }, [isLoading, isPending, isFollowing])

  return (
    <Button
      className="w-full"
      onClick={handleFollow}
      disabled={isLoading || !userPubkey || isPending || !latestFollowList}
      variant={isFollowing ? "outline" : "default"}
    >
      {(isLoading || isPending) && (
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      )}
      {buttonText}
    </Button>
  )
}

export default FollowButton

