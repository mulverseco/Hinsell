"use client"

import { useState } from "react"
import { Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { Media } from "@/core/generated/schemas"


interface ProductGalleryProps {
  images: Media[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id || index}>
                <img
                  src={image.file || `/placeholder.svg?height=600&width=600&query=${productName}`}
                  alt={image.alt_text || productName}
                  className="h-full w-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-12 top-1/2 -translate-y-1/2" />
            </>
          )}
        </Carousel>

        {/* Expand Button */}
        <Button variant="outline" size="icon" className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm">
          <Expand className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-md border-2 transition-colors",
                index === currentImageIndex ? "border-primary" : "border-transparent hover:border-muted-foreground",
              )}
            >
              <img
                src={image.file || "/placeholder.svg"}
                alt={image.alt_text || `${productName} view ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
