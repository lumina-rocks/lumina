import type React from "react"
import { useProfile } from "nostr-react"
import { nip19 } from "nostr-tools"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ReactionButton from "@/components/ReactionButton"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ViewRawButton from "@/components/ViewRawButton"
import ViewNoteButton from "./ViewNoteButton"
import Link from "next/link"
import ViewCopyButton from "./ViewCopyButton"
import type { Event as NostrEvent } from "nostr-tools"
import ZapButton from "./ZapButton"
import Image from "@/components/Image"

interface KIND20CardProps {
  pubkey: string
  text: string
  image: string
  eventId: string
  tags: string[][]
  event: NostrEvent
  showViewNoteCardButton: boolean
}

const KIND20Card: React.FC<KIND20CardProps> = ({
  pubkey,
  text,
  image,
  eventId,
  tags,
  event,
  showViewNoteCardButton,
}) => {
  const { data: userData } = useProfile({
    pubkey,
  })
  const [imageError, setImageError] = useState(false);

  if (!image || !image.startsWith("http") || imageError) return null;
  
  const title =
    userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey)
  text = text.replaceAll("\n", " ")
  const createdAt = new Date(event.created_at * 1000)
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey
  const uploadedVia = tags.find((tag) => tag[0] === "client")?.[1]

  return (
    <>
      <div key={event.id}>
        <Card className="my-4">
          <CardHeader>
            <CardTitle>
              <Link href={hrefProfile} style={{ textDecoration: "none" }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar>
                          <AvatarImage src={profileImageSrc} />
                        </Avatar>
                        <span className="break-all" style={{ marginLeft: "10px" }}>
                          {title}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">
              <div className="w-full flex justify-center">
                <div className="relative w-full h-auto min-h-[300px] max-h-[80vh] flex justify-center">
                  <Image
                    src={image}
                    alt={text}
                    className="rounded-lg object-contain max-w-full h-auto"
                    onError={() => setImageError(true)}
                    priority
                    width={1200}
                    height={800}
                    style={{
                      maxHeight: "80vh",
                      width: "auto",
                      maxWidth: "100%"
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="break-word overflow-hidden">{text}</div>
              <hr className="my-4" />
              <div className="space-x-4 flex justify-between items-start">
                <div className="flex space-x-4">
                  <ReactionButton event={event} />
                  <ZapButton event={event} />
                  {showViewNoteCardButton && <ViewNoteButton event={event} />}
                </div>
                <div className="flex space-x-2">
                  <ViewCopyButton event={event} />
                  <ViewRawButton event={event} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="grid grid-cols-1">
              <small className="text-muted">{createdAt.toLocaleString()}</small>
              {uploadedVia && <small className="text-muted">Uploaded via {uploadedVia}</small>}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

export default KIND20Card