import Image from "next/image"
import Link from "next/link"
import { cn } from "utils/cn"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import { StarIcon } from "components/icons/star-icon"

interface ProductCardProps {
  // Common/Algolia shape
  handle?: string
  title?: string
  featuredImage?: { url?: string; altText?: string }
  images?: unknown
  minPrice?: number
  avgRating?: number
  totalReviews?: number
  vendor?: string
  variants?: Array<{ price?: { amount?: number; currencyCode?: string } }>

  // Backend Item shape
  slug?: string
  name?: string
  media?: Array<{ file?: string; alt_text?: string }>
  sales_price?: string
  minimum_price?: string
  maximum_price?: string
  average_rating?: string
  review_count?: number
  brand?: string
  manufacturer?: string
  units?: unknown[]

  // Local options
  priority?: boolean
  prefetch?: boolean
  className?: string
  href?: string
  highlighted?: boolean
  variant?: "default" | "hero"
}

export const ProductCard = ({
  // common
  variants,
  handle,
  title,
  featuredImage,
  minPrice,
  avgRating,
  totalReviews,
  className,
  priority,
  vendor,
  // backend item
  slug,
  name,
  media,
  sales_price,
  minimum_price,
  maximum_price,
  average_rating,
  review_count,
  brand,
  manufacturer,
  units,
  // options
  prefetch = false,
  href = "",
  highlighted = false,
  variant = "default",
}: ProductCardProps) => {
  const computedHandle = handle || slug || ""
  const displayTitle = title || name || ""
  const displayVendor = vendor || brand || manufacturer

  const imageUrl =
    featuredImage?.url || (Array.isArray(media) && media[0]?.file) || "/default-product-image.svg"
  const imageAlt = featuredImage?.altText || (Array.isArray(media) && media[0]?.alt_text) || displayTitle

  const variantPrice = variants?.find(Boolean)?.price
  const currencySymbol = variantPrice
    ? mapCurrencyToSign((variantPrice.currencyCode as CurrencyType) || "USD")
    : "$"

  const parsedMinPrice =
    typeof minPrice === "number"
      ? minPrice
      : parseFloat(sales_price || minimum_price || maximum_price || "")

  const ratingValue =
    typeof avgRating === "number" ? avgRating : parseFloat(average_rating || "")
  const reviewsCount = typeof totalReviews === "number" ? totalReviews : review_count

  const noOfVariants = (Array.isArray(variants) ? variants.length : 0) || (Array.isArray(units) ? units.length : 0)
  const path = href || `/product/${computedHandle}`
  const linkAria = `Visit product: ${displayTitle}`

  if (variant === "hero") {
    return (
      <Link
        className={cn(
          "group flex flex-col overflow-hidden rounded-lg border border-background/20 bg-background/95 p-3 shadow-xl backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl",
          className
        )}
        aria-label={linkAria}
        href={path}
        prefetch={prefetch}
      >
        <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
          <Image
            priority={priority}
            src={imageUrl}
            alt={imageAlt || ""}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="240px"
          />
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{displayTitle}</h3>
        {!!variantPrice && !Number.isNaN(parsedMinPrice) && (
          <p className="text-sm font-medium text-primary">
            {mapCurrencyToSign((variantPrice.currencyCode as CurrencyType) || "USD") + parsedMinPrice.toFixed(2)}
          </p>
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
          src={imageUrl}
          alt={imageAlt || ""}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="bg-size-200 bg-pos-0 hover:bg-pos-100 flex shrink-0 grow flex-col text-pretty bg-gradient-to-b from-transparent to-primary/5 p-4 transition-all duration-200">
        <h3
          className={cn(
            "line-clamp-2 text-lg font-semibold transition-colors data-[featured]:text-2xl",
            highlighted && "md:text-2xl"
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

        {!!variantPrice && !Number.isNaN(parsedMinPrice) && (
          <div className="mt-auto flex flex-col pt-10">
            {noOfVariants > 0 && (
              <p className={cn("text-sm text-gray-500", highlighted && "md:text-base")}>
                {noOfVariants} variant{noOfVariants > 1 ? "s" : ""}
              </p>
            )}
            <div className={cn("flex w-full items-baseline justify-between text-sm", highlighted && "md:text-base")}>
              <span className="text-primary/50">From</span>
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
