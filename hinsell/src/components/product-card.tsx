import Image from "next/image"
import Link from "next/link"
import { StarIcon } from "./icons/star-icon"
import { cn } from "@/utils/cn"
import { Item } from "@/core/generated/schemas"

interface ProductCardProps {
  item: Item
  priority?: boolean
  prefetch?: boolean
  className?: string
  href?: string
  highlighted?: boolean
  variants?: "default" | "hero"
}

export const ProductCard = ({
  item,
  className,
  priority = false,
  prefetch = false,
  href = "",
  highlighted = false,
  variants = "default",
}: ProductCardProps) => {
  const computedHandle = item.id || item.slug || ""
  const displayTitle = item.name || ""
  const displayVendor = item.brand || item.branch?.branch_name || ""

  const imageUrl = (Array.isArray(item?.media) && item?.media[0]?.file) || "/placeholder.svg?height=300&width=300"
  const imageAlt = (Array.isArray(item?.media) && item?.media[0]?.alt_text) || displayTitle

  const currencySymbol = "$" // Default currency symbol since Item schema doesn't have currency info

  const parsedMinPrice = Number.parseFloat(item.sales_price || item.minimum_price || item.maximum_price || "0")

  const ratingValue = Number.parseFloat(item.average_rating || "0")
  const reviewsCount = item.review_count || 0

  const noOfVariants = Array.isArray(item.units) ? item.units.length : 0
  const path = href || `/product/${computedHandle}`
  const linkAria = `Visit product: ${displayTitle}`

  if (variants === "hero") {
    return (
      <Link
        className={cn(
          "group flex flex-col overflow-hidden rounded-lg border border-background/20 bg-background/95 p-3 shadow-xl backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl",
          className,
        )}
        aria-label={linkAria}
        href={path}
        prefetch={prefetch}
      >
        <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
          <Image
            priority={priority}
            src={imageUrl || "/placeholder.svg"}
            alt={imageAlt || ""}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="240px"
          />
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{displayTitle}</h3>
        {!Number.isNaN(parsedMinPrice) && parsedMinPrice > 0 && (
          <p className="text-sm font-medium text-primary">{currencySymbol + parsedMinPrice.toFixed(2)}</p>
        )}
        <span className="mt-2 text-xs font-medium text-muted-foreground">Shop Now →</span>
      </Link>
    )
  }

  return (
    <Link
      className={cn("group flex h-full w-full flex-col overflow-hidden rounded-lg", className)}
      aria-label={linkAria}
      href={path}
      prefetch={prefetch}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          priority={priority}
          src={imageUrl || "/placeholder.svg"}
          alt={imageAlt || ""}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="bg-size-200 bg-pos-0 hover:bg-pos-100 flex shrink-0 grow flex-col text-pretty bg-gradient-to-b from-transparent to-primary/5 p-4 transition-all duration-200">
        <h3
          className={cn(
            "line-clamp-2 text-lg font-semibold transition-colors data-[featured]:text-2xl",
            highlighted && "md:text-2xl",
          )}
        >
          {displayTitle}
        </h3>
        <div className="flex flex-col pt-1">
          {!!displayVendor && (
            <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>{displayVendor}</p>
          )}

          <div className="flex flex-wrap items-center gap-1">
            {!!ratingValue && !!reviewsCount && (
              <>
                <div className="flex items-center space-x-1">
                  <StarIcon className="size-3.5 fill-gray-800/95 stroke-gray-800/95" />

                  <div className="flex items-center gap-0.5 text-sm font-medium">
                    <div>{ratingValue.toFixed(2)}</div>
                    <span className="text-xs text-gray-500">
                      ({reviewsCount} review{reviewsCount !== 1 && "s"})
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {!Number.isNaN(parsedMinPrice) && parsedMinPrice > 0 && (
          <div className="mt-auto flex flex-col pt-10">
            {noOfVariants > 0 && (
              <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>
                {noOfVariants} variant{noOfVariants > 1 ? "s" : ""}
              </p>
            )}
            <div className={cn("flex w-full items-baseline justify-between text-sm", highlighted && "md:text-base")}>
              {noOfVariants > 1 && <span className="text-primary/50">From</span>}
              <span className={cn("text-base font-semibold md:text-lg", highlighted && "md:text-2xl")}>
                {currencySymbol + parsedMinPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
