import type { Dispatch, SetStateAction } from "react"
import Image from "next/image"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "components/ui/carousel"
import { Item } from "@/core/generated/schemas"
import { cn } from "@/utils/cn"

type CenterSectionProps = {
  images: Item["media"]
  setApi: Dispatch<SetStateAction<CarouselApi>>
  className?: string
}

export const CenterSection = ({ className, images, setApi }: CenterSectionProps) => {
  const validImages = images?.filter((media) => media?.file) || []
  const hasOnlyOneImage = validImages.length <= 1

  return (
    <div className={cn("flex flex-col rounded-t-lg", className)}>
      <div className="md:sticky md:top-[100px]">
        <Carousel className="[&>div]:rounded-lg" setApi={setApi}>
          <CarouselContent className={cn("rounded-lg", hasOnlyOneImage ? "ml-0" : "")}>
            {validImages.map((media, index) => (
              <CarouselItem
                className={cn("relative aspect-square rounded-lg", hasOnlyOneImage && "pl-0")}
                key={media.id || `media-${index}`}
              >
                <Image
                  alt={media.alt_text || `Product image ${index + 1}`}
                  src={media.file || "/placeholder.svg?height=400&width=400&query=product"}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 450px) 300px, 480px"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {!hasOnlyOneImage && (
            <div className="mt-4 flex justify-center gap-10 pb-6">
              <CarouselPrevious className="relative" />
              <CarouselNext className="relative" />
            </div>
          )}
        </Carousel>
      </div>
    </div>
  )
}
