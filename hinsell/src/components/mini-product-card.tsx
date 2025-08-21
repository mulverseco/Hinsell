import { Item } from "@/core/generated/schemas"
import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"

interface MiniProductCardProps {
  product: Item
  priority?: boolean
  prefetch?: boolean
  className?: string
  loading?: "eager" | "lazy"
}

export const MiniProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
  loading = "lazy",
}: MiniProductCardProps) => {
  const variantPrice = product.sales_price || product.maximum_price
  const currencySymbol = variantPrice ? mapCurrencyToSign((variantPrice as CurrencyType) || "USD") : "$"

  return (
    <Link
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/50 bg-background transition-all duration-300 hover:border-border hover:shadow-sm",
        className
      )}
      href={`/product/${product.id}`}
      prefetch={prefetch}
    >
      {}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/5">
        <Image
          priority={priority}
          loading={loading}
          src={product?.media[0].file || "/default-product-image.svg"}
          alt={product?.media[0].alt_text  || product?.name}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 180px"
        />
      </div>

      {}
      <div className="flex flex-1 flex-col p-2">
        <h3 className="line-clamp-1 text-xs font-semibold">{product?.name}</h3>

        {product?.brand && <p className="line-clamp-1 text-[10px] text-muted-foreground">{product?.brand}</p>}

        <div className="mt-auto pt-1">
          {product.minimum_price && (
            <p className="text-xs font-bold">
              {currencySymbol}
              {product.minimum_price}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
