import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import type { CommerceProduct } from "types"
import { StarIcon } from "components/icons/star-icon"
import { Item } from "@/core/generated/schemas"

interface UniformProductCardProps {
  product: Item
  priority?: boolean
  prefetch?: boolean
  className?: string
  featured?: boolean
}

export const UniformProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
  featured = false,
}: UniformProductCardProps) => {
  const variantPrice = product.sales_price || product.maximum_price
  const currencySymbol = variantPrice ? mapCurrencyToSign((variantPrice as CurrencyType) || "USD") : "$"

  return (
    <Link
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-300 hover:shadow-lg",
        className
      )}
      href={`/product/${product.id}`}
      prefetch={prefetch}
    >
      {}
      <div className="relative aspect-square overflow-hidden bg-secondary/5">
        <Image
          priority={priority}
          src={product?.media[0].file || "/default-product-image.svg"}
          alt={product?.media[0].alt_text || product?.name}
          fill
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
          sizes={featured ? "(max-width: 640px) 100vw, 350px" : "(max-width: 640px) 50vw, 250px"}
        />

        {featured && (
          <div className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
            Featured
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className={cn("mb-1 line-clamp-2 font-semibold", featured ? "text-lg" : "text-base")}>{product.name}</h3>

        {product.brand && <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">{product.brand}</p>}

        {}
        {product.review_count && product.review_count && (
          <div className="mb-2 flex items-center gap-1">
            <StarIcon className="size-3.5 fill-foreground/80" />
            <span className="text-sm text-muted-foreground">
              {product.review_count.toFixed(1)}
            </span>
          </div>
        )}

        {}
        <div className="mt-auto">
          {product.minimum_price && (
            <p className={cn("font-bold", featured ? "text-lg" : "text-base")}>
              {currencySymbol}
              {product.minimum_price}
            </p>
          )}
          {product.size && product.color && (
            <p className="text-xs text-muted-foreground">{product.size} / {product.color} variants</p>
          )}
        </div>
      </div>
    </Link>
  )
}
