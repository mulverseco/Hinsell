import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { QuoteIcon } from "lucide-react"
import { UserPublic } from "@/core/generated/schemas"

export type ReviewCardProps = {
  index: string
  review : {
    id: string
    author: UserPublic
    rating: number
    body: string
  }
}

export const ReviewCard = ({ index, review }: ReviewCardProps) => {
  return (
    <Card
      key={index}
      className="border-border/50 bg-background/60 hover:border-primary/20 group overflow-hidden rounded-xl border p-1 transition-all duration-300 hover:shadow-lg"
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div
              className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all"
              aria-hidden="true"
            >
              <QuoteIcon className="text-primary h-6 w-6" />
            </div>
            <div className="text-muted-foreground text-right text-sm tracking-wide italic">
              Client Testimonial
            </div>
          </div>

          <p className="text-foreground text-lg">
            <span aria-hidden="true">&ldquo;</span>
            <span>{review.body}</span>
            <span aria-hidden="true">&ldquo;</span>
          </p>

          <div className="flex items-center gap-4 border-t pt-5">
            <Avatar className="border-border/50 h-12 w-12 border-2">
              <AvatarImage
                src={review.author.profile}
                alt={`${review.author.username || "t"}'s avatar`}
              />
              <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                {review?.author?.username?.charAt(0) ?? "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold tracking-tight">
                {review.author.username}
              </div>
              <div className="text-muted-foreground text-sm">
                {review.author.user_type}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
