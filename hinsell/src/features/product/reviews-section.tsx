"use client"
import { Star, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Item, ItemReview } from "@/core/generated/schemas"

interface DynamicReviewsProps {
  item: Item
  reviews?: ItemReview[]
}

export function ReviewsSection({ item, reviews = [] }: DynamicReviewsProps) {
  const actualReviews = item.reviews || reviews
  const averageRating = Number(item.average_rating || 0)
  const reviewCount = item.review_count || 0

  const getFitDistribution = () => {
    if (!actualReviews.length) return { too_small: 0, fits_well: 100, too_big: 0 }

    const fitCounts = actualReviews.reduce(
      (acc, review) => {
        const fit = review.fit || "fits_well"
        acc[fit] = (acc[fit] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const total = actualReviews.length
    return {
      too_small: Math.round(((fitCounts.too_small || 0) / total) * 100),
      fits_well: Math.round(((fitCounts.fits_well || 0) / total) * 100),
      too_big: Math.round(((fitCounts.too_big || 0) / total) * 100),
    }
  }

  const fitDistribution = getFitDistribution()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Customer Reviews</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold">{averageRating.toFixed(2)}</span>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Overall Fit:</h3>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Small</span>
            <span>True to Size</span>
            <span>Large</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-8">{fitDistribution.too_small}%</span>
            <div className="flex-1 bg-gray-200 h-2 rounded overflow-hidden flex">
              <div className="bg-red-400 h-full" style={{ width: `${fitDistribution.too_small}%` }} />
              <div className="bg-green-500 h-full" style={{ width: `${fitDistribution.fits_well}%` }} />
              <div className="bg-blue-400 h-full" style={{ width: `${fitDistribution.too_big}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8">{fitDistribution.too_big}%</span>
          </div>
        </div>
      </div>

      {/* Review filters */}
      <div className="flex items-center gap-6 border-b pb-2">
        <button className="text-sm font-medium border-b-2 border-black pb-2">All Reviews</button>
        <button className="text-sm text-gray-500 pb-2">With Images</button>
        <button className="text-sm text-gray-500 pb-2">Verified Purchase</button>
      </div>

      <div className="space-y-6">
        {actualReviews.length > 0 ? (
          actualReviews.map((review, index) => (
            <div key={review.id || index} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                  {review.is_anonymous ? "A***" : "U***"}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at || "").toLocaleDateString()}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified Purchase</span>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 space-x-4">
                    {review.fit && (
                      <span>Overall Fit: {review.fit.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                    )}
                    {review.reviewer_height && <span>Height: {review.reviewer_height}</span>}
                    {review.reviewer_weight && <span>Weight: {review.reviewer_weight}</span>}
                  </div>

                  {review.comment && <p className="text-sm text-gray-800 dark:text-gray-400">{review.comment}</p>}

                  <div className="flex items-center gap-4">
                    <button className="text-xs text-blue-600 underline">Translate</button>
                    <div className="flex items-center gap-2 ml-auto">
                      <button className="flex items-center gap-1 text-xs text-gray-500">
                        <ThumbsUp className="h-3 w-3" />
                        {review.helpful_votes || 0}
                      </button>
                      <button className="text-xs text-gray-500">⋯</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  )
}
