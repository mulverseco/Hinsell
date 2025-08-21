import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import { StarIcon } from "components/icons/star-icon"
import { Item } from "@/core/generated/schemas"

interface ProductCardProps{
  product : Item
  priority?: boolean
  prefetch?: boolean
  className?: string
}

export const FeaturedProductCard = ({
  product,
  className,
  priority,
  prefetch = false,
}: ProductCardProps) => {
  const href = `/product/${product?.id}`
  const linkAria = `Visit product: ${product?.name}`
  const variantPrice = product?.sales_price || product?.maximum_price

  return (
    <Link
      className={cn("group flex flex-col overflow-hidden rounded-lg border border-gray-100 transition-all", className)}
      aria-label={linkAria}
      href={href}
      prefetch={prefetch}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          priority={priority}
          className="object-cover transition-transform group-hover:scale-105"
          src={product?.media[0]?.file || "/default-product-image.svg"}
          alt={product?.media[0]?.alt_text || product?.name}
          fill
        />
      </div>
      <div className="flex shrink-0 grow items-start  justify-between p-4 transition-colors group-hover:bg-gradient-to-t group-hover:from-gray-100 group-hover:to-transparent">
        <div className="flex flex-col gap-1">
          {}
          <h3 className="line-clamp-2 text-lg font-semibold">{product?.name.split(" ").slice(1).join(" ")}</h3>
          {!!variantPrice && (
            <span className="block sm:hidden">
              From {mapCurrencyToSign((variantPrice as CurrencyType) || "USD") + product.minimum_price}
            </span>
          )}

          <div className="mt-auto flex flex-col gap-1">
            {!!product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
            <div className="flex items-center gap-1">
              {!!product.review_count && !!product.review_count && (
                <>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="size-4 fill-gray-400 stroke-gray-500" />
                    <span className="text-sm">{product.review_count.toFixed(2)}</span>
                    <span className="text-xs">
                      ({product.review_count} review{product.review_count !== 1 && "s"})
                    </span>
                  </div>
                  •
                </>
              )}
              {/* {noOfVariants > 0 && (
                <p className="text-sm text-gray-500">
                  {noOfVariants} variant{noOfVariants > 1 ? "s" : ""}
                </p>
              )} */}
            </div>
          </div>
        </div>
        {!!variantPrice && (
          <span className="hidden sm:block">
             From {mapCurrencyToSign((variantPrice as CurrencyType) || "USD") + product.minimum_price}
          </span>
        )}
      </div>
    </Link>
  )
}
