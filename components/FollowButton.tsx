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

  // Extract the list of pubkeys the user is following
  const followingPubkeys = useMemo(() => {
    if (!latestFollowList) return []
    return latestFollowList.tags
      .filter(tag => tag[0] === "p")
      .map(tag => tag[1])
  }, [latestFollowList])

  // Determine if the user is following the profile
  useEffect(() => {
    if (!isPending) {
      const following = followingPubkeys.includes(pubkey)
      setIsFollowing(following)
    }
  }, [followingPubkeys, pubkey, isPending])

  const handleFollow = useCallback(async () => {
    if (!userPubkey || isPending || isLoading) return

    setIsPending(true)
    // Optimistically update UI
    const newFollowingState = !isFollowing
    setIsFollowing(newFollowingState)

    try {
      // Create a new follow list based on current follows
      let newFollowList = [...followingPubkeys]
      
      if (newFollowingState) {
        // Add to follow list if not already there
        if (!newFollowList.includes(pubkey)) {
          newFollowList.push(pubkey)
        }
      } else {
        // Remove from follow list
        newFollowList = newFollowList.filter(pk => pk !== pubkey)
      }

      // Get all non-'p' tags from the original event to preserve them
      const nonPTags = latestFollowList 
        ? latestFollowList.tags.filter(tag => tag[0] !== "p") 
        : []
      
      // Convert to properly formatted p tags and combine with non-p tags
      const pTags = newFollowList.map(pk => ["p", pk])
      const allTags = [...nonPTags, ...pTags]

      // Create the follow list event (NIP-02)
      const followEvent: NostrEvent = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags: allTags,
        content: "",
        pubkey: "", // Placeholder, will be set by signEvent
        id: "", // Placeholder, will be set by signEvent
        sig: "", // Placeholder, will be set by signEvent
      }

      // Sign and publish the event
      const signedEvent = await signEvent(loginType, followEvent) as NostrEvent
      
      if (signedEvent) {
        publish(signedEvent)
        // Don't need to update local state since the useEffect will catch the new event
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
  }, [userPubkey, isPending, isLoading, isFollowing, followingPubkeys, pubkey, loginType, publish])

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
      disabled={isLoading || !userPubkey || isPending}
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

