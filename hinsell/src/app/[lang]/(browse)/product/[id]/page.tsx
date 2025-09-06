import type React from "react"

import { Crown, Gift, Users } from "lucide-react"
import { ProductGallery } from "@/features/product/product-images"
import { ProductInfo } from "@/features/product/product-info"
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

  const hasColor = item?.variants?.some(v => v.attributes)




  const inStock = !!item?.variants?.length

  const freeShipping = true

  const specifications = {
    Brand: item?.brand || 'N/A',
    Manufacturer: item?.manufacturer || 'N/A',
    Type: item?.item_type || 'Product',
    'Base Unit': item?.base_unit || 'N/A',
    Weight: item?.variants?.[0]?.weight || 'N/A',
    Volume: item?.variants?.[0]?.volume || 'N/A',
  }


  const mockReviews: any[] = []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 overflow-hidden">
        <Breadcrumbs className="mb-8" items={makeBreadcrumbs(item?.item_group_name, item?.item_group, item?.name)} />
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

function makeBreadcrumbs(item_group_name?: string,item_group_id?: string,item_name?: string) {

  return {
    Home: "/",
    [item_group_name || "Products"]: item_group_name
      ? `/category/${item_group_id}`
      : "/search",
    [item_name || ""]: "",
  }
}