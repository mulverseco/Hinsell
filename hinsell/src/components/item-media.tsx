"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Play, Pause } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { Media } from "@/core/generated/schemas"

interface ItemMediaProps {
  images?: Media[]
  className?: string
}

export function ItemMedia({ images = [], className }: ItemMediaProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const primaryMedia = images?.[0]
  const isVideo =
    primaryMedia?.file?.includes(".mp4") ||
    primaryMedia?.file?.includes(".webm") ||
    primaryMedia?.file?.includes(".mov")

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {primaryMedia ? (
        isVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className={cn("w-full h-full object-cover", imageLoading && "blur-sm")}
              muted
              loop
              playsInline
              poster="/luxury-product.png"
              onLoadedData={() => setImageLoading(false)}
            >
              <source src={primaryMedia.file} type="video/mp4" />
            </video>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-4 left-4 h-10 w-10 p-0 bg-black/70 backdrop-blur-sm hover:bg-black/80 rounded-full shadow-lg border-0 z-10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleVideo()
              }}
            >
              {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
            </Button>
          </div>
        ) : (
          <Image
            src={primaryMedia.file || "/placeholder.svg?height=500&width=400&query=luxury product"}
            alt={primaryMedia.alt_text || "Product Image"}
            fill
            className={cn("object-cover", imageLoading && "blur-sm")}
            onLoad={() => setImageLoading(false)}
            priority
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ShoppingCart className="h-16 w-16 text-gray-300" />
        </div>
      )}
    </div>
  )
}
