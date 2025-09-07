import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Crown, Gift, Truck, Percent } from "lucide-react"
import type React from "react"

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
}

export function ProductOffers({ offers }: ProductOffersProps) {
  const getOfferIcon = (type: string) => {
    switch (type) {
      case "discount":
        return <Percent className="h-3 w-3" />
      case "bestseller":
        return <Crown className="h-3 w-3" />
      case "membership":
        return <Gift className="h-3 w-3" />
      case "shipping":
        return <Truck className="h-3 w-3" />
      default:
        return null
    }
  }

  const getOfferVariant = (type: string) => {
    switch (type) {
      case "discount":
        return "destructive"
      case "bestseller":
        return "secondary"
      case "membership":
        return "outline"
      case "shipping":
        return "default"
      default:
        return "default"
    }
  }

  return (
      <div className={cn("space-y-2", offers[0].className,)}>
      {offers.map((offer) => (
        <div
          key={offer.id}
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg border transition-colors hover:bg-muted/50",
            offer.className,
          )}
        >
          <Badge variant={offer.variant || getOfferVariant(offer.type)} className="flex items-center gap-1 shrink-0">
            {getOfferIcon(offer.type)}
            {offer.title}
          </Badge>
          {offer.description && <span className="text-sm text-muted-foreground">{offer.description}</span>}
        </div>
      ))}
    </div>
  )
}
