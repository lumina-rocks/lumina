import { useNostr, useNostrEvents } from "nostr-react"
import { finalizeEvent, nip19, type NostrEvent } from "nostr-tools"
import type React from "react"
import { type ChangeEvent, type FormEvent, useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { encode } from "blurhash"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/spinner"
import { signEvent } from "@/utils/utils"

async function calculateBlurhash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      canvas.width = 32
      canvas.height = 32
      ctx?.drawImage(img, 0, 0, 32, 32)
      const imageData = ctx?.getImageData(0, 0, 32, 32)
      if (imageData) {
        const blurhash = encode(imageData.data, imageData.width, imageData.height, 4, 4)
        resolve(blurhash)
      } else {
        reject(new Error("Failed to get image data"))
      }
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const UploadComponent: React.FC = () => {
  const { publish } = useNostr()
  const { createHash } = require("crypto")
  const loginType = typeof window !== "undefined" ? window.localStorage.getItem("loginType") : null
  const [previewUrl, setPreviewUrl] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [uploadedNoteId, setUploadedNoteId] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [shouldFetch, setShouldFetch] = useState(false)

  const { events, isLoading: isNoteLoading } = useNostrEvents({
    filter: shouldFetch
      ? {
          ids: uploadedNoteId ? [uploadedNoteId] : [],
          kinds: [20],
          limit: 1,
        }
      : { ids: [], kinds: [20], limit: 1 },
    enabled: shouldFetch,
  })

  useEffect(() => {
    if (uploadedNoteId) {
      setShouldFetch(true)
    }
  }, [uploadedNoteId])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (shouldFetch && events.length === 0 && !isNoteLoading) {
      timeoutId = setTimeout(() => {
        setRetryCount((prevCount) => prevCount + 1)
        setShouldFetch(false)
        setShouldFetch(true)
      }, 5000) // Retry every 5 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [shouldFetch, events, isNoteLoading])

  const handleRetry = useCallback(() => {
    setRetryCount((prevCount) => prevCount + 1)
    setShouldFetch(false)
    setShouldFetch(true)
  }, [])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (url.startsWith("blob:")) {
        setPreviewUrl(url)
      }

      // Optional: Bereinigung alter URLs
      return () => URL.revokeObjectURL(url)
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const desc = formData.get("description") as string
    const file = formData.get("file") as File
    let sha256 = ""
    let finalNoteContent = desc
    let finalFileUrl = ""
    console.log("File:", file)

    if (!desc && !file.size) {
      alert("Please enter a description and/or upload a file")
      setIsLoading(false)
      return
    }

    // get every hashtag in desc and cut off the # symbol
    let hashtags: string[] = desc.match(/#[a-zA-Z0-9]+/g) || []
    if (hashtags) {
      hashtags = hashtags.map((hashtag) => hashtag.slice(1))
    }

    // If file is present, upload it to the media server
    if (file) {
      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as ArrayBuffer)
          reader.onerror = () => reject(reader.error)
          reader.readAsArrayBuffer(file)
        })
      }

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file)
        const hashBuffer = createHash("sha256").update(Buffer.from(arrayBuffer)).digest()
        sha256 = hashBuffer.toString("hex")

        const unixNow = () => Math.floor(Date.now() / 1000)
        const newExpirationValue = () => (unixNow() + 60 * 5).toString()

        const pubkey = window.localStorage.getItem("pubkey")
        const createdAt = Math.floor(Date.now() / 1000)

        // Create auth event for blossom auth via nostr
        const authEvent: NostrEvent = {
          kind: 24242,
          content: desc,
          created_at: createdAt,
          tags: [
            ["t", "upload"],
            ["x", sha256],
            ["expiration", newExpirationValue()],
          ],
          pubkey: "", // Add a placeholder for pubkey
          id: "", // Add a placeholder for id
          sig: "", // Add a placeholder for sig
        }

        console.log(authEvent)

        // Sign auth event
        let authEventSigned = (await signEvent(loginType, authEvent)) as NostrEvent

        // Actually upload the file
        await fetch("https://void.cat/upload", {
          method: "PUT",
          body: file,
          headers: { authorization: "Nostr " + btoa(JSON.stringify(authEventSigned)) },
        }).then(async (res) => {
          if (res.ok) {
            const responseText = await res.text()
            const responseJson = JSON.parse(responseText)
            finalFileUrl = responseJson.url
          } else {
            alert(await res.text())
          }
        })
      } catch (error) {
        alert("Error: " + error)
        console.error("Error reading file:", error)
      }
    }

    const noteTags = hashtags.map((tag) => ["t", tag])

    let blurhash = ""
    if (file && file.type.startsWith("image/")) {
      try {
        blurhash = await calculateBlurhash(file)
      } catch (error) {
        console.error("Error calculating blurhash:", error)
      }
    }

    if (finalFileUrl) {
      const image = new Image()
      image.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        image.onload = resolve
      })

      finalNoteContent = desc
      noteTags.push([
        "imeta",
        "url " + finalFileUrl,
        "m " + file.type,
        "x " + sha256,
        "ox " + sha256,
        "blurhash " + blurhash,
        `dim ${image.width}x${image.height}`,
      ])
    }

    const createdAt = Math.floor(Date.now() / 1000)

    // Create the actual note
    const noteEvent: NostrEvent = {
      kind: 20,
      content: finalNoteContent,
      created_at: createdAt,
      tags: noteTags,
      pubkey: "", // Add a placeholder for pubkey
      id: "", // Add a placeholder for id
      sig: "", // Add a placeholder for sig
    }

    let signedEvent: NostrEvent | null = null

    // Sign the actual note
    signedEvent = (await signEvent(loginType, noteEvent)) as NostrEvent

    // If we got a signed event, publish it to nostr
    if (signedEvent) {
      console.log("final Event: ")
      console.log(signedEvent)
      publish(signedEvent)
    }

    setIsLoading(false)
    if (signedEvent != null) {
      setUploadedNoteId(signedEvent.id)
      setIsDrawerOpen(true)
      setShouldFetch(true)
      setRetryCount(0)
    }
  }

  return (
    <>
      <div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Textarea
            name="description"
            rows={6}
            placeholder="Your description"
            id="description"
            className="w-full"
          ></Textarea>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input id="file" name="file" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {previewUrl && <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full pt-4" />}
          {isLoading ? (
            <Button className="w-full" disabled>
              Uploading.. <ReloadIcon className="m-2 h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button className="w-full">Upload</Button>
          )}
        </form>
      </div>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Upload Status</DrawerTitle>
            <DrawerDescription>
              {isNoteLoading ? (
                <div className="flex items-center space-x-2">
                  <Spinner />
                  <span>Checking note status...</span>
                </div>
              ) : events.length > 0 ? (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> Note found with ID: </span>
                  <span className="block sm:inline font-mono">
                    {`${events[0].id.slice(0, 5)}...${events[0].id.slice(-3)}`}
                  </span>
                </div>
              ) : (
                <p>Note not found. It may take a moment to propagate.</p>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col space-y-2">
            {events.length === 0 && (
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Retry Now
              </Button>
            )}
            <Button asChild className="w-full">
              <a href={`/note/${nip19.noteEncode(uploadedNoteId)}`}>View Note</a>
            </Button>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)} className="w-full">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default UploadComponent