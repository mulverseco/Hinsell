"use client"

import { useState } from "react"
import { Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Media } from "@/core/generated/schemas"
import Image from "next/image"

interface ProductGalleryProps {
  images?: Media[]
  productName: string
}

export function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)


  console.log("ProductGallery images:", images);
  // if (!images || images.length === 0) {
  //   return (
  //     <div className="relative flex-1 aspect-square overflow-hidden rounded-lg bg-muted">
  //       <Image
  //         src={`/placeholder.svg?height=600&width=600&query=${productName}`}
  //         alt={productName}
  //         fill
  //         className="object-cover"
  //         unoptimized
  //       />
  //     </div>
  //   )
  // }

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-20">
          {images.map((image, index) => (
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
                  src={image.file || `/placeholder.svg?height=80&width=80&query=${productName} thumbnail ${index + 1}`}
                  alt={image.alt_text || `${productName} view ${index + 1}`}
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
          src={images[currentImageIndex]?.file || `/placeholder.svg?height=600&width=600&query=${productName}`}
          alt={images[currentImageIndex]?.alt_text || productName}
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