"use client"

import { Star, ThumbsUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ItemReview } from "@/core/generated/schemas"

interface ProductReviewsProps {
  rating: number
  reviewCount: number
  reviews: ItemReview[]
}

export function ProductReviews({ rating, reviewCount, reviews }: ProductReviewsProps) {
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0
    return { stars, count, percentage }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{rating.toFixed(1)}</div>
              <div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Based on {reviewCount} reviews</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-8">{stars}★</span>
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{review.is_anonymous ? "Anonymous" : "Verified Customer"}</p>
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {review.comment && <p className="text-sm leading-relaxed">{review.comment}</p>}

                {review.fit && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Fit:</span>
                    <Badge variant="outline" className="text-xs">
                      {review.fit.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {review.created_at && new Date(review.created_at).toLocaleDateString()}
                  </p>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">Helpful ({review.helpful_votes || 0})</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            <Button className="mt-4">Write a Review</Button>
          </div>
        )}
      </div>
    </div>
  )
}
