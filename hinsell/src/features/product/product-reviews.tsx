"use client"

import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  author: string
  rating: number
  date: string
  title: string
  content: string
  helpful: number
  verified: boolean
  size?: string
  color?: string
  fit?: "Small" | "True to Size" | "Large"
}

interface ProductReviewsProps {
  rating: number
  reviewCount: number
  reviews: Review[]
}

export function ProductReviews({ rating, reviewCount, reviews }: ProductReviewsProps) {
  const ratingDistribution = [
    { stars: 5, count: 850, percentage: 85 },
    { stars: 4, count: 100, percentage: 10 },
    { stars: 3, count: 30, percentage: 3 },
    { stars: 2, count: 15, percentage: 1.5 },
    { stars: 1, count: 5, percentage: 0.5 },
  ]

  const fitData = [
    { label: "Small", percentage: 4 },
    { label: "True to Size", percentage: 90 },
    { label: "Large", percentage: 6 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{rating}</div>
            <div className="flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{reviewCount.toLocaleString()} reviews</div>
          </div>

          <div className="flex-1 space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 text-sm">
                <span className="w-8">{item.stars}★</span>
                <Progress value={item.percentage} className="flex-1 h-2" />
                <span className="w-8 text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fit Information */}
        <div className="space-y-2">
          <h3 className="font-medium">Overall Fit:</h3>
          <div className="flex gap-8">
            {fitData.map((fit) => (
              <div key={fit.label} className="text-center">
                <div className="text-sm font-medium">{fit.label}</div>
                <div className="text-xs text-muted-foreground">{fit.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Filter and Sort */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          All Reviews
        </Button>
        <Button variant="outline" size="sm">
          Image
        </Button>
        <Button variant="outline" size="sm">
          5 Stars (850)
        </Button>
        <Button variant="outline" size="sm">
          4 Stars (100)
        </Button>
        <Button variant="outline" size="sm">
          Verified Purchase
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3 pb-6 border-b last:border-b-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.author}</span>
                  {review.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </div>

              {(review.size || review.color || review.fit) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {review.size && <div>Size: {review.size}</div>}
                  {review.color && <div>Color: {review.color}</div>}
                  {review.fit && <div>Fit: {review.fit}</div>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{review.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful ({review.helpful})
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline">Load More Reviews</Button>
      </div>
    </div>
  )
}
