import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Crown, Gift, Star, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Offer {
  id: string
  type: "discount" | "bestseller" | "membership" | "shipping" | "custom"
  title: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
}

interface ProductOffersProps {
  offers: Offer[]
  className?: string
}

export function ProductOffers({ offers, className }: ProductOffersProps) {
  const getOfferIcon = (type: Offer["type"], customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon

    switch (type) {
      case "discount":
        return <Gift className="h-3 w-3" />
      case "bestseller":
        return <Crown className="h-3 w-3" />
      case "membership":
        return <Users className="h-3 w-3" />
      case "shipping":
        return <Star className="h-3 w-3" />
      default:
        return null
    }
  }

  const getOfferVariant = (type: Offer["type"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "discount":
        return "destructive"
      case "bestseller":
        return "default"
      case "membership":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {offers.map((offer) => (
        <div
          key={offer.id}
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg border transition-colors hover:bg-muted/50",
            offer.className,
          )}
        >
          <Badge variant={offer.variant || getOfferVariant(offer.type)} className="flex items-center gap-1 shrink-0">
            {getOfferIcon(offer.type, offer.icon)}
            {offer.title}
          </Badge>
          {offer.description && <span className="text-sm text-muted-foreground">{offer.description}</span>}
        </div>
      ))}
    </div>
  )
}
