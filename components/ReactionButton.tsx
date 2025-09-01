import React, { useState, useEffect, useMemo } from "react";
import { useNostrEvents } from "nostr-react";
import { Event as NostrEvent } from "nostr-tools";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ReloadIcon } from "@radix-ui/react-icons"
import ReactionButtonReactionList from "./ReactionButtonReactionList"
import { signEvent } from "@/utils/utils"
import { publishToOutbox } from "@/utils/publishUtils";
import { useCurrentUserPubkey } from "@/utils/relayHooks";

export default function ReactionButton({ event }: { event: any }) {
  const loginType = typeof window !== "undefined" ? window.localStorage.getItem("loginType") : null
  const loggedInUserPublicKey = typeof window !== "undefined" ? window.localStorage.getItem("pubkey") : null
  const currentUserPubkey = useCurrentUserPubkey()

  const [liked, setLiked] = useState(false)
  const [likeIcon, setLikeIcon] = useState("")

  const { events, isLoading } = useNostrEvents({
    filter: {
      "#e": [event.id],
      kinds: [7],
    },
  })

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      return e.tags.filter((tag) => tag[0] === "e" && tag[1] !== event.id).length === 0
    })
  }, [events, event.id])

  const reactionCount = filteredEvents.length

  useEffect(() => {
    const userReaction = filteredEvents.find((e) => e.pubkey === loggedInUserPublicKey)
    if (userReaction) {
      setLiked(true)
      setLikeIcon(userReaction.content)
    } else {
      setLiked(false)
      setLikeIcon("")
    }
  }, [filteredEvents, loggedInUserPublicKey])

  const onPost = async (icon: string) => {
    const message = icon || "+"

    const likeEvent: NostrEvent = {
      content: message,
      kind: 7,
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: "",
      id: "",
      sig: "",
    }

    likeEvent.tags.push(["e", event.id])
    likeEvent.tags.push(["p", event.pubkey])
    likeEvent.tags.push(["k", event.kind.toString()])

    const signedEvent = await signEvent(loginType, likeEvent)

    if (signedEvent) {
      await publishToOutbox(signedEvent, currentUserPubkey || undefined)
      setLiked(true)
      setLikeIcon(message)
      filteredEvents.push(signedEvent)
    } else {
      console.error("Failed to sign event")
      alert("Failed to sign event")
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant={liked ? "default" : "outline"}>
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> 💜
            </>
          ) : (
            <>
              {reactionCount} {liked ? likeIcon : "💜"}
            </>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Reactions</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 grid grid-cols-3">
          <Button
            variant={liked && likeIcon === "💜" ? "secondary" : "outline"}
            className={`mx-1`}
            onClick={() => onPost("💜")}
          >
            💜
          </Button>
          <Button
            variant={liked && likeIcon === "👍" ? "secondary" : "outline"}
            className={`mx-1`}
            onClick={() => onPost("👍")}
          >
            👍
          </Button>
          <Button
            variant={liked && likeIcon === "👎" ? "secondary" : "outline"}
            className={`mx-1`}
            onClick={() => onPost("👎")}
          >
            👎
          </Button>
        </div>
        <hr className="my-4" />
        <ReactionButtonReactionList filteredEvents={filteredEvents} />
        <DrawerFooter>
          <DrawerClose asChild>
            <div>
              <Button variant={"secondary"}>Close</Button>
            </div>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}