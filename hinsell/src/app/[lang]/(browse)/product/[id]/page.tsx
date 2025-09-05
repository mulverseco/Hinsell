import type React from "react"

import { Crown, Gift, Users } from "lucide-react"
import { Item, ItemVariant, Media } from "@/core/generated/schemas"
import { ProductGallery } from "@/features/product/product-images"
import { ProductInfo, type ProductInfoProps } from "@/features/product/product-info"
import { ProductReviews } from "@/features/product/product-reviews"
import { itemsRead } from "@/core/generated/actions"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"


interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params
  const data = await itemsRead({path:{id:id}})
  const item = data.data

  const price = Number(item?.variants?.[0]?.sales_price || 0)
  const originalPrice = Number(item?.variants?.[0]?.maximum_price || item?.variants?.[0]?.wholesale_price)
  const hasDiscount = !!originalPrice && originalPrice > price
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  const hasColor = item?.variants?.some(v => v.color)
  const hasSize = item?.variants?.some(v => v.size)

  const uniqueColorsCount = new Set(item?.variants?.map(v => v.color)).size
  const uniqueSizesCount = new Set(item?.variants?.map(v => v.size)).size

  let colors: ItemVariant[] = []
  let sizes: ItemVariant[] = []

  if (uniqueColorsCount > 1) {
    colors = item?.variants || []
  } else if (uniqueSizesCount > 1) {
    sizes = item?.variants || []
  } else {
    // Default to variants for colors if no variation detected
    colors = item?.variants || []
  }

  const inStock = !!item?.variants?.length // Assume in stock if variants exist

  const freeShipping = true // Or derive from item if possible

  const specifications = {
    Brand: item?.brand || 'N/A',
    Manufacturer: item?.manufacturer || 'N/A',
    Type: item?.item_type || 'Product',
    'Base Unit': item?.base_unit || 'N/A',
    Weight: item?.variants?.[0]?.weight || 'N/A',
    Volume: item?.variants?.[0]?.volume || 'N/A',
  }

  const offers: ProductInfoProps['offers'] = []

  if (hasDiscount) {
    offers.push({
      id: 'discount',
      type: 'discount',
      title: `-${discount}% OFF`,
      variant: 'destructive',
    })
  }

  if (item?.is_featured) {
    offers.push({
      id: 'bestseller',
      type: 'bestseller',
      title: 'Best Seller',
      icon: <Crown className="h-4 w-4" />,
    })
  }

  if (freeShipping) {
    offers.push({
      id: 'shipping',
      type: 'shipping',
      title: 'Free Shipping',
      icon: <Gift className="h-4 w-4" />,
    })
  }

  if (item?.allow_bonus) {
    offers.push({
      id: 'membership',
      type: 'membership',
      title: 'Bonus Eligible',
      icon: <Users className="h-4 w-4" />,
    })
  }

  const mockReviews: any[] = [] // Replace with real reviews fetch if available

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 overflow-hidden">
        <Breadcrumbs className="mb-8" items={makeBreadcrumbs(item)} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="lg:sticky lg:top-8">
            <ProductGallery images={item?.media ?? []} productName={item?.name || ""} />
          </div>
          <div>
            <ProductInfo
              name={item?.name || ""}
              price={price}
              originalPrice={originalPrice || undefined}
              rating={Number.parseFloat(item?.average_rating || "0")}
              reviewCount={item?.review_count || 0}
              description={item?.description || ""}
              shortDescription={item?.short_description}
              colors={colors}
              sizes={sizes}
              inStock={inStock}
              freeShipping={freeShipping}
              specifications={specifications}
              offers={offers}
            />
          </div>
        </div>

        <div className="mt-16">
          <ProductReviews
            rating={Number.parseFloat(item?.average_rating || "0")}
            reviewCount={item?.review_count || 0}
            reviews={mockReviews}
          />
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-primary/5 rounded-xl">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-bold text-lg">Join Our Community</h3>
              <p className="text-sm text-muted-foreground">Get exclusive deals and updates!</p>
            </div>
          </div>
          <Button variant="default">Sign Up Now</Button>
        </div>
      </div>
    </div>
  )
}

function makeBreadcrumbs(item?: Item) {
  const itemGroup = item?.item_group

  return {
    Home: "/",
    [itemGroup?.name || "Products"]: itemGroup?.slug
      ? `/category/${itemGroup?.id}`
      : "/search",
    [item?.name || ""]: "",
  }
}