"use client"

import { useNostr, useNostrEvents } from "nostr-react"
import { nip19, type NostrEvent } from "nostr-tools"
import type React from "react"
import { type ChangeEvent, type FormEvent, useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ReloadIcon, UploadIcon, ImageIcon } from "@radix-ui/react-icons"
import { Input } from "./ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Function to strip metadata from image files
async function stripImageMetadata(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      // Create a canvas to draw the image without metadata
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image onto the canvas (this strips the metadata)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0)

      // Convert canvas back to a file
      canvas.toBlob((blob) => {
        // Clean up the object URL
        URL.revokeObjectURL(objectUrl)
        
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"))
          return
        }

        // Create a new file with the same name but stripped metadata
        const strippedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        })

        resolve(strippedFile)
      }, file.type)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image"))
    }
    
    img.src = objectUrl
  })
}

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
  const [serverChoice, setServerChoice] = useState("blossom.band")
  const [enableNip89, setEnableNip89] = useState(false)

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

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target

    // Replace links only if they contain https://lumina.rocks
    let updatedValue = value;
    
    // Replace https://lumina.rocks/profile/npub1... with "nostr:npub1..."
    updatedValue = updatedValue.replace(/https:\/\/lumina\.rocks\/profile\/(npub[1-9a-zA-Z]{0,64})/g, "nostr:$1");
    
    // Replace https://lumina.rocks/note/note1... with "nostr:note1..."
    updatedValue = updatedValue.replace(/https:\/\/lumina\.rocks\/note\/(note[1-9a-zA-Z]{0,64})/g, "nostr:$1");
    
    // Update the textarea with the modified value
    event.target.value = updatedValue;
    
    return updatedValue
  }

  const handleServerChange = (value: string) => {
    setServerChoice(value)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const desc = formData.get("description") as string
    let file = formData.get("file") as File
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
        // Strip metadata from the file
        file = await stripImageMetadata(file)

        const arrayBuffer = await readFileAsArrayBuffer(file)
        const hashBuffer = createHash("sha256").update(Buffer.from(arrayBuffer)).digest()
        sha256 = hashBuffer.toString("hex")

        const unixNow = () => Math.floor(Date.now() / 1000)
        const newExpirationValue = () => (unixNow() + 60 * 5).toString()

        const pubkey = window.localStorage.getItem("pubkey")
        const createdAt = Math.floor(Date.now() / 1000)

        // alert("SHA256: " + sha256)

        // Create auth event for blossom auth via nostr
        const authEvent: NostrEvent = {
          kind: 24242,
          // content: desc,
          content: "File upload",
          created_at: createdAt,
          tags: [
            // ["t", "media"],
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
        const authEventSigned = (await signEvent(loginType, authEvent)) as NostrEvent
        // authEventSigned as base64 encoded string
        const authString = Buffer.from(JSON.stringify(authEventSigned)).toString("base64")

        const blossomServer = "https://" + serverChoice

        // await fetch(blossomServer + "/media", {
        await fetch(blossomServer + "/upload", {
          method: "PUT",
          body: file,
          headers: { authorization: "Nostr " + authString },
        }).then(async (res) => {
          if (res.ok) {
            const responseText = await res.text()
            const responseJson = JSON.parse(responseText)
            finalFileUrl = responseJson.url
            sha256 = responseJson.sha256

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
                "blurhash " + blurhash,
                `dim ${image.width}x${image.height}`,
              ])
              noteTags.push(["x", sha256])
            }

            const createdAt = Math.floor(Date.now() / 1000)

            // NIP-89 client tagging (optional)
            if (enableNip89) {
              noteTags.push([
                "client",
                "lumina",
                "31990:" + "ff363e4afc398b7dd8ceb0b2e73e96fe9621ababc22ab150ffbb1aa0f34df8b2" + ":" + createdAt,
              ])
            }

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
              // alert(JSON.stringify(signedEvent))
            }

            setIsLoading(false)
            if (signedEvent != null) {
              setUploadedNoteId(signedEvent.id)
              setIsDrawerOpen(true)
              setShouldFetch(true)
              setRetryCount(0)
            }
          } else {
            // alert(await res.text())
            throw new Error("Failed to upload file: " + (await res.text()))
          }
        })
      } catch (error) {
        alert(error)
        console.error("Error reading file:", error)
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle>Share Content</CardTitle>
          <CardDescription>Upload an image with your description to the Nostr network</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                rows={4}
                placeholder="What's on your mind? Add #hashtags to categorize your post."
                id="description"
                className="w-full resize-none"
                onChange={handleTextChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <div className="flex flex-col items-center space-y-4 text-center">
                  {previewUrl ? (
                    <div className="w-full rounded-md">
                      <img 
                        src={previewUrl} 
                        alt="Preview"  
                      />
                    </div>
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {previewUrl ? "Replace image" : "Add image"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Supported formats: JPEG, PNG, WebP
                    </div>
                  </div>
                  
                  <label 
                    htmlFor="file" 
                    className={`relative cursor-pointer rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors 
                      ${previewUrl ? 'bg-muted hover:bg-muted/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  >
                    {previewUrl ? "Change file" : "Select file"}
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="server-choice">Upload destination</Label>
                  <p className="text-xs text-muted-foreground">Choose where to store your image</p>
                </div>
                <Select onValueChange={handleServerChange} value={serverChoice}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={serverChoice} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blossom.band">blossom.band</SelectItem>
                    <SelectItem value="blossom.primal.net">blossom.primal.net</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="nip89-toggle">Client tagging</Label>
                  <p className="text-xs text-muted-foreground">Enable NIP-89 client identification</p>
                </div>
                <Switch id="nip89-toggle" checked={enableNip89} onCheckedChange={setEnableNip89} />
              </div>
            </div>
            
            <div className="pt-4">
              {isLoading ? (
                <Button className="w-full" disabled>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </Button>
              ) : (
                <Button type="submit" className="w-full">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Share to Nostr
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
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