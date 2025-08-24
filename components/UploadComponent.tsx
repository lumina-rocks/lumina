"use client"

import { useNostr, useNostrEvents } from "nostr-react"
import { nip19, type NostrEvent } from "nostr-tools"
import type React from "react"
import { type ChangeEvent, type FormEvent, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// File type detection functions
const getFileTypeFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    const extension = pathname.split('.').pop()
    
    if (!extension) return null
    
    // Image extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'apng', 'avif']
    if (imageExtensions.includes(extension)) {
      return 'image'
    }
    
    // Video extensions
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'm4a']
    if (videoExtensions.includes(extension)) {
      return 'video'
    }
    
    return null
  } catch {
    return null
  }
}

const getFileTypeFromFile = (file: File): string => {
  if (file.type.startsWith('image/')) {
    return 'image'
  } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    return 'video'
  }
  return 'unknown'
}

const getKindFromFileType = (fileType: string): string => {
  switch (fileType) {
    case 'image':
      return '20'
    case 'video':
      return '21' // Default to normal video, user can change to 22 if needed
    default:
      return '20' // Default fallback
  }
}

const isValidKindForFileType = (kind: string, fileType: string): boolean => {
  if (fileType === 'image') {
    return kind === '20'
  } else if (fileType === 'video') {
    return kind === '21' || kind === '22'
  }
  return false
}

// Reference validation functions
const isValidHexId = (value: string): boolean => {
  return /^[a-fA-F0-9]{64}$/.test(value)
}

const isValidNoteId = (value: string): boolean => {
  return value.startsWith('note') && value.length > 5
}

const isValidNEvent = (value: string): boolean => {
  return value.startsWith('nevent') && value.length > 7
}

const isValidNAddr = (value: string): boolean => {
  return value.startsWith('naddr') && value.length > 6
}

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const validateReference = (type: "e" | "a" | "u", value: string): { isValid: boolean; error?: string } => {
  if (!value.trim()) {
    return { isValid: true } // Empty is valid (optional field)
  }

  // Remove "nostr:" prefix for validation
  let valueToValidate = value.trim()
  if (valueToValidate.startsWith('nostr:')) {
    valueToValidate = valueToValidate.substring(6)
  }

  switch (type) {
    case "e":
      // Accept hex IDs, note..., nevent..., or URLs containing them
      if (isValidHexId(valueToValidate) || isValidNoteId(valueToValidate) || isValidNEvent(valueToValidate) || 
          valueToValidate.includes('note') || valueToValidate.includes('nevent') || /^[a-fA-F0-9]{64}$/.test(valueToValidate)) {
        return { isValid: true }
      }
      return { 
        isValid: false, 
        error: "Invalid event reference. Must be a 64-character hex ID, note..., nevent..., or URL containing them" 
      }
    
    case "a":
      // Accept naddr... or URLs containing them
      if (isValidNAddr(valueToValidate) || valueToValidate.includes('naddr')) {
        return { isValid: true }
      }
      return { 
        isValid: false, 
        error: "Invalid address reference. Must be an naddr... or URL containing it" 
      }
    
    case "u":
      if (isValidUrl(value)) {
        return { isValid: true }
      }
      return { 
        isValid: false, 
        error: "Invalid URL. Must be a valid URL starting with http:// or https://" 
      }
    
    default:
      return { isValid: false, error: "Unknown reference type" }
  }
}

// Normalization functions
const normalizeEventReference = (value: string): string => {
  // Remove "nostr:" prefix if present
  let trimmed = value.trim()
  if (trimmed.startsWith('nostr:')) {
    trimmed = trimmed.substring(6)
  }
  
  // If it's already a hex ID, return as is
  if (isValidHexId(trimmed)) {
    return trimmed.toLowerCase()
  }
  
  // If it's a note..., extract the hex ID
  if (isValidNoteId(trimmed)) {
    try {
      const decoded = nip19.decode(trimmed)
      if (decoded.type === 'note' && typeof decoded.data === 'object' && decoded.data !== null && 'id' in decoded.data) {
        return (decoded.data as { id: string }).id
      }
    } catch {
      // If decoding fails, return as is
      return trimmed
    }
  }
  
  // If it's a nevent..., extract the hex ID
  if (isValidNEvent(trimmed)) {
    try {
      const decoded = nip19.decode(trimmed)
      if (decoded.type === 'nevent' && typeof decoded.data === 'object' && decoded.data !== null && 'id' in decoded.data) {
        return (decoded.data as { id: string }).id
      }
    } catch {
      // If decoding fails, return as is
      return trimmed
    }
  }
  
  // If it's a URL that might contain a note ID, try to extract it
  if (trimmed.includes('note') || trimmed.includes('nevent')) {
    const noteMatch = trimmed.match(/(note[a-zA-Z0-9]+)/)
    const neventMatch = trimmed.match(/(nevent[a-zA-Z0-9]+)/)
    
    if (noteMatch) {
      return normalizeEventReference(noteMatch[1])
    }
    if (neventMatch) {
      return normalizeEventReference(neventMatch[1])
    }
  }
  
  // If it's a hex ID but with different casing, normalize to lowercase
  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  
  return trimmed
}

const normalizeAddressReference = (value: string): string => {
  // Remove "nostr:" prefix if present
  let trimmed = value.trim()
  if (trimmed.startsWith('nostr:')) {
    trimmed = trimmed.substring(6)
  }
  
  // If it's already an naddr..., return as is
  if (isValidNAddr(trimmed)) {
    return trimmed
  }
  
  // If it's a URL that might contain an naddr, try to extract it
  if (trimmed.includes('naddr')) {
    const naddrMatch = trimmed.match(/(naddr[a-zA-Z0-9]+)/)
    if (naddrMatch) {
      return naddrMatch[1]
    }
  }
  
  return trimmed
}

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim()
  
  try {
    const url = new URL(trimmed)
    // Normalize to lowercase protocol and hostname
    url.protocol = url.protocol.toLowerCase()
    url.hostname = url.hostname.toLowerCase()
    // Remove trailing slash from pathname if it's just a slash
    if (url.pathname === '/') {
      url.pathname = ''
    }
    return url.toString()
  } catch {
    return trimmed
  }
}

const normalizeReference = (type: "e" | "a" | "u", value: string): string => {
  switch (type) {
    case "e":
      return normalizeEventReference(value)
    case "a":
      return normalizeAddressReference(value)
    case "u":
      return normalizeUrl(value)
    default:
      return value
  }
}

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
  const searchParams = useSearchParams()
  const [previewUrl, setPreviewUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")
  const [selectedKind, setSelectedKind] = useState("20")
  const [serverChoice, setServerChoice] = useState("blossom.band")
  const [enableNip89, setEnableNip89] = useState(false)
  const [referenceType, setReferenceType] = useState<"e" | "a" | "u">("e")
  const [referenceValue, setReferenceValue] = useState("")
  const [detectedFileType, setDetectedFileType] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [thumbnailUrl, setThumbnailUrl] = useState("") // New state for video thumbnails
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [uploadedNoteId, setUploadedNoteId] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [shouldFetch, setShouldFetch] = useState(false)

  const { events, isLoading: isNoteLoading } = useNostrEvents({
    filter: shouldFetch
      ? {
          ids: uploadedNoteId ? [uploadedNoteId] : [],
          kinds: [parseInt(selectedKind)],
          limit: 1,
        }
      : { ids: [], kinds: [parseInt(selectedKind)], limit: 1 },
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

      // Detect file type and auto-select kind
      const fileType = getFileTypeFromFile(file)
      setDetectedFileType(fileType)
      
      if (fileType !== 'unknown') {
        const suggestedKind = getKindFromFileType(fileType)
        setSelectedKind(suggestedKind)
      }

      // Optional: Bereinigung alter URLs
      return () => URL.revokeObjectURL(url)
    }
  }

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value
    setImageUrl(url)
    setPreviewUrl(url)
    
    // Detect file type from URL and auto-select kind
    if (url) {
      const fileType = getFileTypeFromUrl(url)
      setDetectedFileType(fileType)
      
      if (fileType) {
        const suggestedKind = getKindFromFileType(fileType)
        setSelectedKind(suggestedKind)
      }
    } else {
      setDetectedFileType(null)
    }
  }

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target

    // Replace links only if they contain https://lumina.rocks
    let updatedValue = value;
    
    // Replace https://lumina.rocks/profile/npub... with "nostr:npub..."
    updatedValue = updatedValue.replace(/https:\/\/lumina\.rocks\/profile\/(npub[1-9a-zA-Z]{0,64})/g, "nostr:$1");
    
    // Replace https://lumina.rocks/note/note... with "nostr:note..."
    updatedValue = updatedValue.replace(/https:\/\/lumina\.rocks\/note\/(note[1-9a-zA-Z]{0,64})/g, "nostr:$1");
    
    // Update the textarea with the modified value
    event.target.value = updatedValue;
    
    return updatedValue
  }

  const handleServerChange = (value: string) => {
    setServerChoice(value)
  }

  const handleKindChange = (value: string) => {
    // Validate that the selected kind is compatible with the detected file type
    if (detectedFileType && !isValidKindForFileType(value, detectedFileType)) {
      alert(`Invalid kind selection: Kind ${value} is not compatible with ${detectedFileType} files.`)
      return
    }
    setSelectedKind(value)
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleReferenceTypeChange = (value: string) => {
    setReferenceType(value as "e" | "a" | "u")
    setReferenceValue("") // Clear the value when type changes
  }

  const handleReferenceValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReferenceValue(event.target.value)
  }

  const handleThumbnailUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setThumbnailUrl(event.target.value)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const desc = formData.get("description") as string
    const title = formData.get("title") as string
    let file = formData.get("file") as File
    let sha256 = ""
    let finalNoteContent = desc
    let finalFileUrl = ""
    console.log("File:", file)
    console.log("File type:", typeof file)
    console.log("File is null:", file === null)
    console.log("File is undefined:", file === undefined)



    const hasFile = file && file.size && file.size > 0
    if (!desc && !hasFile && !imageUrl) {
      alert("Please enter a description and/or upload a file or provide an image URL")
      setIsLoading(false)
      return
    }

    // Validate kind and file type compatibility
    if (detectedFileType && !isValidKindForFileType(selectedKind, detectedFileType)) {
      alert(`Invalid combination: Kind ${selectedKind} cannot be used with ${detectedFileType} files.`)
      setIsLoading(false)
      return
    }

    // Validate reference if provided
    if (referenceValue.trim()) {
      const validation = validateReference(referenceType, referenceValue)
      if (!validation.isValid) {
        alert(validation.error)
        setIsLoading(false)
        return
      }
    }

    // Check if user is authenticated
    const pubkey = window.localStorage.getItem("pubkey")
    if (!loginType || !pubkey) {
      alert("You must be logged in to upload files. Please log in and try again.")
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
        console.log("Login type:", loginType)
        console.log("Pubkey from localStorage:", pubkey)

        // Sign auth event
        let authEventSigned: NostrEvent
        try {
          const signedEvent = await signEvent(loginType, authEvent)
          if (!signedEvent) {
            throw new Error("Failed to sign event - no signed event returned")
          }
          authEventSigned = signedEvent
        } catch (error) {
          console.error("Error signing event:", error)
          alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your login and try again.`)
          setIsLoading(false)
          return
        }
        
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

            const noteTags = [
              ...(title ? [["title", title]] : []),
              ...hashtags.map((tag) => ["t", tag]),
              ...(referenceValue.trim() ? [[referenceType, normalizeReference(referenceType, referenceValue)]] : [])
            ]

            let blurhash = ""
            if (selectedKind === "20" && file && file.type.startsWith("image/")) {
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
              
              // Add imeta tag based on kind
              if (selectedKind === "20") {
                // Picture event - use imeta with image-specific properties
                noteTags.push([
                  "imeta",
                  "url " + finalFileUrl,
                  "m " + file.type,
                  "x " + sha256,
                  "blurhash " + blurhash,
                  `dim ${image.width}x${image.height}`,
                ])
                noteTags.push(["x", sha256])
                noteTags.push(["m", file.type])
              } else if (selectedKind === "21" || selectedKind === "22") {
                // Video events - use imeta with video-specific properties
                const videoImetaTags = [
                  "imeta",
                  `dim ${image.width}x${image.height}`,
                  "url " + finalFileUrl,
                  "x " + sha256,
                  "m " + file.type,
                ]
                
                // Add thumbnail URL as image field if provided
                if (thumbnailUrl) {
                  videoImetaTags.push("image " + thumbnailUrl)
                }
                
                noteTags.push(videoImetaTags)
                noteTags.push(["x", sha256])
              }
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
              kind: parseInt(selectedKind),
              content: finalNoteContent,
              created_at: createdAt,
              tags: noteTags,
              pubkey: "", // Add a placeholder for pubkey
              id: "", // Add a placeholder for id
              sig: "", // Add a placeholder for sig
            }

            let signedEvent: NostrEvent | null = null

            // Sign the actual note
            try {
              const signedNoteEvent = await signEvent(loginType, noteEvent)
              if (!signedNoteEvent) {
                throw new Error("Failed to sign note event - no signed event returned")
              }
              signedEvent = signedNoteEvent
            } catch (error) {
              console.error("Error signing note event:", error)
              // Don't show alert for this error since the auth event already succeeded
              // Just log it and continue if possible
              console.warn("Note signing failed, but continuing...")
            }

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
    } else if (imageUrl) {
      // Handle image URL upload
      try {
        const createdAt = Math.floor(Date.now() / 1000)
        const noteTags = [
          ...(title ? [["title", title]] : []),
          ...hashtags.map((tag) => ["t", tag]),
          ...(referenceValue.trim() ? [[referenceType, normalizeReference(referenceType, referenceValue)]] : [])
        ]

        // Add the image URL directly to the note
        finalNoteContent = desc
        
        // Add imeta tag based on kind
        if (selectedKind === "20") {
          // Picture event - use imeta with image-specific properties
          noteTags.push(["imeta", "url " + imageUrl])
        } else if (selectedKind === "21" || selectedKind === "22") {
          // Video events - use imeta with video-specific properties
          const videoImetaTags = ["imeta", "url " + imageUrl]
          
          // Add thumbnail URL as image field if provided
          if (thumbnailUrl) {
            videoImetaTags.push("image " + thumbnailUrl)
          }
          
          noteTags.push(videoImetaTags)
        }

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
          kind: parseInt(selectedKind),
          content: finalNoteContent,
          created_at: createdAt,
          tags: noteTags,
          pubkey: "", // Add a placeholder for pubkey
          id: "", // Add a placeholder for id
          sig: "", // Add a placeholder for sig
        }

        let signedEvent: NostrEvent | null = null

        // Sign the actual note
        try {
          const signedNoteEvent = await signEvent(loginType, noteEvent)
          if (!signedNoteEvent) {
            throw new Error("Failed to sign note event - no signed event returned")
          }
          signedEvent = signedNoteEvent
        } catch (error) {
          console.error("Error signing note event:", error)
          // Don't show alert for this error since the auth event already succeeded
          // Just log it and continue if possible
          console.warn("Note signing failed, but continuing...")
        }

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
      } catch (error) {
        alert(error)
        console.error("Error processing image URL:", error)
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle>Share Content</CardTitle>
          <CardDescription>
            {detectedFileType 
              ? `${detectedFileType === 'image' 
                  ? 'Upload an image' 
                  : 'Upload a video'} with your description to the Nostr network (Kind ${selectedKind})`
              : selectedKind === "20" 
                ? "Upload an image with your description to the Nostr network"
                : selectedKind === "21"
                ? "Upload a normal video with your description to the Nostr network"
                : "Upload a short video with your description to the Nostr network"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                name="title"
                placeholder="Enter a title for your post"
                id="title"
                className="w-full"
                value={title}
                onChange={handleTitleChange}

              />
            </div>
            
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
              <Label>{selectedKind === "20" ? "Image" : "Video"}</Label>
              <Tabs defaultValue="file" searchParam="upload-method">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Media URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      {previewUrl ? (
                        <div className="w-full rounded-md">
                          {selectedKind === "20" ? (
                            <img 
                              src={previewUrl} 
                              alt="Preview"  
                            />
                          ) : (
                            <video 
                              src={previewUrl} 
                              controls
                              className="w-full rounded-md"
                            />
                          )}
                        </div>
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {previewUrl 
                            ? `Replace ${selectedKind === "20" ? "image" : "video"}` 
                            : `Add ${selectedKind === "20" ? "image" : "video"}`
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedKind === "20" 
                            ? "Supported formats: JPEG, PNG, WebP, GIF, APNG, AVIF" 
                            : "Supported formats: MP4, WebM, MOV, AVI, M4V, MKV, M4A"
                          }
                        </div>
                      </div>
                      
                      <label 
                        htmlFor="file" 
                        className={`relative cursor-pointer rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors 
                          ${previewUrl ? 'bg-muted hover:bg-muted/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                      >
                        {previewUrl ? "Change file" : `Select ${selectedKind === "20" ? "image" : "video"}`}
                        <Input
                          id="file"
                          name="file"
                          type="file"
                          accept={selectedKind === "20" 
                            ? "image/jpeg,image/png,image/webp,image/gif,image/apng,image/avif"
                            : "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-m4v,video/x-matroska,audio/mp4"
                          }
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">{selectedKind === "20" ? "Image URL" : "Video URL"}</Label>
                    <Input
                      id="image-url"
                      name="image-url"
                      type="url"
                      placeholder={selectedKind === "20" 
                        ? "https://example.com/image.jpg" 
                        : "https://example.com/video.mp4"
                      }
                      value={imageUrl}
                      onChange={handleUrlChange}
                      className="w-full"
                    />
                  </div>
                  
                  {previewUrl && (
                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-medium mb-2">Preview:</div>
                      {selectedKind === "20" ? (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full rounded-md"
                          onError={() => setPreviewUrl("")}
                        />
                      ) : (
                        <video 
                          src={previewUrl} 
                          controls
                          className="w-full rounded-md"
                          onError={() => setPreviewUrl("")}
                        />
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <Separator className="my-4" />
            
            {/* Thumbnail URL field for video events */}
            {(selectedKind === "21" || selectedKind === "22") && (
              <div className="space-y-2">
                <Label htmlFor="thumbnail-url">Video Thumbnail Image URL (Optional)</Label>
                <Input
                  id="thumbnail-url"
                  name="thumbnail-url"
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={thumbnailUrl}
                  onChange={handleThumbnailUrlChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Provide an image URL to use as a thumbnail/preview for your video. This will be displayed in galleries and feeds.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="kind-choice">Note Kind</Label>
                  <p className="text-xs text-muted-foreground">
                    {detectedFileType 
                      ? `Detected: ${detectedFileType} file - ${detectedFileType === 'image' ? 'Use Kind 20 for images' : 'Use Kind 21/22 for videos'}`
                      : "Choose the type of note to publish"
                    }
                    {detectedFileType && (
                      <span className="ml-1 text-xs text-green-600 font-medium">
                        (Auto-selected)
                      </span>
                    )}
                  </p>
                </div>
                <Select onValueChange={handleKindChange} value={selectedKind}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={selectedKind} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20" disabled={detectedFileType === 'video'}>
                      Kind 20 - Picture Event
                    </SelectItem>
                    <SelectItem value="21" disabled={detectedFileType === 'image'}>
                      Kind 21 - Normal Video
                    </SelectItem>
                    <SelectItem value="22" disabled={detectedFileType === 'image'}>
                      Kind 22 - Short Video
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
              
              <div className="space-y-3">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="reference-type">Reference Type</Label>
                    <p className="text-xs text-muted-foreground">Add a reference to another event, address, or URL</p>
                  </div>
                  <Select onValueChange={handleReferenceTypeChange} value={referenceType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={referenceType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="e">Event (e)</SelectItem>
                      <SelectItem value="a">Address (a)</SelectItem>
                      <SelectItem value="u">URL (u)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference-value">
                    Reference Value
                    {referenceType === "e" && " (nostr:note..., note..., nevent..., hex ID, or URL)"}
                    {referenceType === "a" && " (nostr:naddr..., naddr..., or URL)"}
                    {referenceType === "u" && " (URL)"}
                  </Label>
                  <Input
                    id="reference-value"
                    name="reference-value"
                    type="text"
                    placeholder={
                      referenceType === "e" 
                        ? "nostr:note... or note... or nevent... or hex ID or URL"
                        : referenceType === "a"
                        ? "nostr:naddr... or naddr... or URL containing naddr"
                        : "https://example.com"
                    }
                    value={referenceValue}
                    onChange={handleReferenceValueChange}
                    className="w-full"
                  />
                  {referenceValue.trim() && (
                    <div className="space-y-1">
                      <p className={`text-xs ${validateReference(referenceType, referenceValue).isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {validateReference(referenceType, referenceValue).isValid 
                          ? "✓ Valid reference" 
                          : validateReference(referenceType, referenceValue).error
                        }
                      </p>
                      {validateReference(referenceType, referenceValue).isValid && (
                        <p className="text-xs text-blue-600">
                          Will be stored as: {normalizeReference(referenceType, referenceValue)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-4 space-y-2">
              {isLoading ? (
                <Button className="w-full" disabled>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  {uploadMethod === "file" ? "Uploading..." : "Publishing..."}
                </Button>
              ) : (
                <>
                  <Button type="submit" className="w-full">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Share to Nostr
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Reset form and close modal
                      setTitle("")
                      setImageUrl("")
                      setPreviewUrl("")
                      setDetectedFileType(null)
                      setSelectedKind("20")
                      setReferenceType("e")
                      setReferenceValue("")
                      setIsLoading(false)
                    }}
                  >
                    Cancel
                  </Button>
                </>
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
              <a href={`/note/${nip19.neventEncode({
                id: uploadedNoteId,
                relays: []
              })}`}>View Note</a>
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