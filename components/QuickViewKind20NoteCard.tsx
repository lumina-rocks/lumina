"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { nip19 } from "nostr-tools"
import { Card, SmallCardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { extractDimensions, getChecksumSha256 } from "@/utils/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuickViewKind20NoteCardProps {
  pubkey: string
  text: string
  image: string
  eventId: string
  tags: string[][]
  event: any
  linkToNote: boolean
}

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

const QuickViewKind20NoteCard: React.FC<QuickViewKind20NoteCardProps> = ({
  pubkey,
  text,
  image,
  eventId,
  tags,
  event,
  linkToNote,
}) => {
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

  const processedText = text.replaceAll("\n", " ")
  const encodedNoteId = nip19.noteEncode(event.id)

  const { width, height } = extractDimensions(event)

  const card = (
    <Card className="aspect-square">
      <SmallCardContent className="h-full p-0">
        <div className="h-full w-full">
          <div className="relative w-full h-full">
            <Image
              src={image || "/placeholder.svg"}
              alt={processedText}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="rounded lg:rounded-lg object-cover"
              priority
              onError={() => setImageError(true)}
            />

            {/* Red line under image when verification fails */}
            {verificationStatus === false && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 z-10"></div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">Image verification failed ✗</p>
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
            )}
          </div>
        </div>
      </SmallCardContent>
    </Card>
  )

  return (
    <>
      {linkToNote ? (
        <Link href={`/note/${encodedNoteId}`} className="block w-full aspect-square">
          {card}
        </Link>
      ) : (
        card
      )}
    </>
  )
}

export default QuickViewKind20NoteCard

