import { cn } from "@/lib/utils"
import { StarIcon } from "lucide-react"


export const StarRating = ({ rating }: { rating: number }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <div className="flex items-center">
      {stars.map((star) => (
        <StarIcon
          key={star}
          className={cn("size-4", star <= rating ? "fill-gray-800/95 stroke-gray-800/95" : "stroke-gray-800")}
        />
      ))}
    </div>
  )
}
