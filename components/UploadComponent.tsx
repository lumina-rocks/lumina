import type React from "react"
import { type ChangeEvent, type FormEvent, useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ReloadIcon } from "@radix-ui/react-icons"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNDK } from "@/hooks/useNDK"
import { createHash } from "crypto"

async function calculateBlurhash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }
      ctx.drawImage(img, 0, 0, 32, 32)
      const imageData = ctx.getImageData(0, 0, 32, 32)
      const blurhash = encode(imageData.data, imageData.width, imageData.height, 4, 4)
      resolve(blurhash)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const UploadComponent: React.FC = () => {
  const ndk = useNDK()
  const [file, setFile] = useState<File | null>(null)
  const [desc, setDesc] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadUrl, setUploadUrl] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [visibility, setVisibility] = useState("public")
  const [imageData, setImageData] = useState<{
    width: number;
    height: number;
    hash: string;
    blurhash: string;
  } | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDescChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(e.target.value)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return

    setIsUploading(true)
    let sha256: string

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

      // Create auth event for blossom auth via nostr
      const authEvent = ndk.getEvent()
      authEvent.kind = 24242
      authEvent.content = desc
      authEvent.created_at = Math.floor(Date.now() / 1000)
      authEvent.tags = [
        ["t", "upload"],
        ["x", sha256],
        ["url", "https://nostr.build"],
        ["method", "POST"],
        ["exp", newExpirationValue()],
      ]

      // Sign the event
      if (typeof window !== "undefined") {
        const loginType = window.localStorage.getItem("loginType")
        if (loginType === "extension") {
          const signedEvent = await window.nostr.signEvent(authEvent.rawEvent())
          Object.assign(authEvent, signedEvent)
        } else if (loginType === "raw_nsec") {
          const nsecStr = window.localStorage.getItem("nsec")
          if (!nsecStr) throw new Error("No nsec found")
          await authEvent.sign()
        }
      }

      // Create form data and upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("auth", JSON.stringify(authEvent.rawEvent()))

      const response = await fetch("https://nostr.build/api/v2/upload/files", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      setUploadUrl(result.data[0].url)

      // Create kind 20 nostr event
      const ndkEvent = ndk.getEvent()
      ndkEvent.kind = 20
      ndkEvent.content = desc
      ndkEvent.created_at = Math.floor(Date.now() / 1000)

      // Add image dimensions and blurhash if available
      if (imageData) {
        ndkEvent.tags.push(["dim", `${imageData.width}x${imageData.height}`])
        ndkEvent.tags.push(["blurhash", imageData.blurhash])
      }

      ndkEvent.tags.push(["r", result.data[0].url])
      ndkEvent.tags.push(["client", "lumina"])
      if (visibility !== "public") {
        ndkEvent.tags.push(["sensitive", "true"])
      }

      // Sign and publish
      if (typeof window !== "undefined") {
        const loginType = window.localStorage.getItem("loginType")
        if (loginType === "extension") {
          const signedEvent = await window.nostr.signEvent(ndkEvent.rawEvent())
          Object.assign(ndkEvent, signedEvent)
        } else if (loginType === "raw_nsec") {
          const nsecStr = window.localStorage.getItem("nsec")
          if (!nsecStr) throw new Error("No nsec found")
          await ndkEvent.sign()
        }
      }

      await ndkEvent.publish()
      setIsDrawerOpen(false)
      window.location.href = "/"
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (file) {
      // Get image dimensions and calculate blurhash
      const img = new Image()
      img.onload = async () => {
        const blurhash = await calculateBlurhash(file)
        setImageData({
          width: img.width,
          height: img.height,
          hash: "",
          blurhash,
        })
      }
      img.src = URL.createObjectURL(file)
    }
  }, [file])

  return (
    <div className="w-full max-w-full">
      {isUploading ? (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <Textarea
                placeholder="Write a description..."
                value={desc}
                onChange={handleDescChange}
                rows={4}
              />
            </div>
            <div>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="sensitive">Sensitive Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button type="submit" className="w-full">
                Upload
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default UploadComponent