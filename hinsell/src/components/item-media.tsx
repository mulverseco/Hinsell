"use client"

import { useState } from "react"
import { Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Media } from "@/core/generated/schemas"


interface ItemMediaProps {
  media: Media[]
  alt?: string
  className?: string
}

export function ItemMedia({ media, alt,className }: ItemMediaProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className={cn("flex w-full h-full overflow-hidden gap-4", className)}>
      {media.length > 1 && (
        <div className="flex flex-col gap-2 w-20">
          {media?.map((image, index) => (
            <button
              key={image.id || index}
              onMouseEnter={() => setCurrentImageIndex(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-md border-2 transition-all duration-200 hover:border-primary/50",
                index === currentImageIndex ? "border-primary ring-2 ring-primary/20" : "border-muted",
              )}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.file || `/placeholder.svg?height=80&width=80&query=${alt} thumbnail ${index + 1}`}
                  alt={image.alt_text || `${alt} view ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={media[currentImageIndex]?.file || `/placeholder.svg?height=600&width=600&query=${alt}`}
          alt={media[currentImageIndex]?.alt_text || alt}
          fill
          className="object-cover transition-opacity duration-300"
          unoptimized
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <Expand className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
