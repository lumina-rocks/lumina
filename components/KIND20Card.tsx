"use client"

import type React from "react"
import { useProfile } from "nostr-react"
import { nip19 } from "nostr-tools"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReactionButton from "@/components/ReactionButton"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ViewRawButton from "@/components/ViewRawButton"
import ViewNoteButton from "./ViewNoteButton"
import Link from "next/link"
import ViewCopyButton from "./ViewCopyButton"
import type { Event as NostrEvent } from "nostr-tools"
import ZapButton from "./ZapButton"
import Image from "next/image"
import { CheckCircle, XCircle } from "lucide-react"
import { getChecksumSha256 } from "@/utils/utils"

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
  const [imageError, setImageError] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null)
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null)
  const [eventImageHash, setEventImageHash] = useState<string | null>(null)

  useEffect(() => {
    // Skip verification if there's no valid image
    if (!image || !image.startsWith("http") || imageError) return

    const verifyImage = async () => {
      try {
        // get hash of the image from event tags
        let hash = tags.find((tag) => tag[0] === "x")?.[1]

        if (!hash) {
          hash = tags
            .find((tag) => tag[0] === "imeta")
            ?.find((tag) => tag.startsWith("x"))
            ?.split(" ")[1]
        }

        setEventImageHash(hash || null)

        if (hash) {
          // get blob from the image url
          const response = await fetch(image)
          const blob = await response.blob()
          const sha256 = await getChecksumSha256(blob)

          setCalculatedHash(sha256)
          // Determine verification status
          setVerificationStatus(hash === sha256)
        }
      } catch (error) {
        console.error("Error verifying image:", error)
        setVerificationStatus(null)
      }
    }

    verifyImage()
  }, [image, tags, imageError])

  if (!image || !image.startsWith("http") || imageError) return null

  const title =
    userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey)
  text = text.replaceAll("\n", " ")
  const createdAt = new Date(event.created_at * 1000)
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey
  const uploadedVia = tags.find((tag) => tag[0] === "client")?.[1]

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
            <div className="px-2 sm:px-4">
              <div className="w-full">
                <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={text}
                    fill
                    className="rounded-lg object-contain"
                    onError={() => setImageError(true)}
                  />

                  {/* Verification status indicator with tooltip */}
                  {verificationStatus !== null && (
                    <div className="absolute top-2 right-2 z-10">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-black/50 rounded-full p-1">
                              {verificationStatus ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">
                                {verificationStatus ? "Image verified ✓" : "Image verification failed ✗"}
                              </p>
                              <div>
                                <p className="font-medium">Event hash:</p>
                                <p className="break-all">{eventImageHash}</p>
                              </div>
                              <div>
                                <p className="font-medium">Calculated hash:</p>
                                <p className="break-all">{calculatedHash}</p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
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