import type React from "react"
import { useState } from "react"
import { nip19 } from "nostr-tools"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ReactionButton from "@/components/ReactionButton"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ViewRawButton from "@/components/ViewRawButton"
import ViewNoteButton from "./ViewNoteButton"
import Link from "next/link"
import ViewCopyButton from "./ViewCopyButton"
import ZapButton from "./ZapButton"
import Image from "next/image"
import { useProfile } from "@/hooks/useNDK"

interface KIND20CardProps {
  pubkey: string;
  text: string;
  image: string;
  eventId: string;
  tags: string[][];
  event: any;
  showViewNoteCardButton: boolean;
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
  const { data: userData } = useProfile(pubkey);
  const [imageError, setImageError] = useState(false);

  if (!image || imageError) return null;

  const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || nip19.npubEncode(pubkey);
  text = text.replaceAll("\n", " ");
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.image || "https://robohash.org/" + pubkey;
  const uploadedVia = tags.find((tag) => tag[0] === "client")?.[1];

  return (
    <>
      <div key={event.id} className="py-6">
        <Card>
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
                        <span className="break-all" style={{ marginLeft: "10px" }}>{title}</span>
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
          <CardContent>
            <div>
              <div className="space-y-2">
                {text && <p className="break-words whitespace-pre-wrap">{text}</p>}
                <div>
                  <div className="d-flex justify-content-center align-items-center">
                    <div style={{ position: "relative" }}>
                      <img
                        src={image}
                        className="rounded lg:rounded-lg"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "75vh",
                          objectFit: "contain",
                          margin: "auto",
                        }}
                        alt={text}
                        onError={() => setImageError(true)}
                      />
                    </div>
                  </div>
                </div>
              </div>
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