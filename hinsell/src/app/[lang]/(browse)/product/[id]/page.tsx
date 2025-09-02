import type React from "react"

import { Crown, Gift, Users } from "lucide-react"
import { Item, ItemVariant, Media } from "@/core/generated/schemas"
import { ProductGallery } from "@/features/product/product-images"
import { ProductInfo } from "@/features/product/product-info"
import { ProductReviews } from "@/features/product/product-reviews"
import { itemsRead } from "@/core/generated/actions"
import { Breadcrumbs } from "@/components/breadcrumbs"


const mockProduct: Partial<Item> & {
  price: number
  originalPrice?: number
  colors: ItemVariant[]
  sizes: ItemVariant[]
  images: Media[]
  inStock: boolean
  freeShipping: boolean
  specifications: Record<string, string>
  offers: Array<{
    id: string
    type: "discount" | "bestseller" | "membership" | "shipping" | "custom"
    title: string
    description?: string
    icon?: React.ReactNode
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }>
} = {
  name: "Halloween Casual Women's Round Neck Fashion Long Sleeve Letter Print Sweatshirt",
  price: 7.55,
  originalPrice: 17.5,
  average_rating: "4.81",
  review_count: 1000,
  description:
    "T-shirt material, thought it might be like a sweat shirt. I prefer the t-shirt like material a lot. Nice and thick material and doesn't feel cheap. The lettering is dyed rather than a sticker. I feel like this will last me for years. It's also a nice color as well.",
  short_description: "Comfortable Halloween-themed sweatshirt with premium letter print design.",
  offers: [
    {
      id: "1",
      type: "bestseller",
      title: "#16 Bestseller",
      description: "in Halloween Women Sweatshirts",
      icon: <Crown className="h-3 w-3" />,
      variant: "default",
    },
    {
      id: "2",
      type: "membership",
      title: "SHEIN CLUB",
      description: "Save $0.49 off this item after joining.",
      icon: <Users className="h-3 w-3" />,
      variant: "secondary",
    },
    {
      id: "3",
      type: "discount",
      title: "30% OFF",
      description: "For orders $9.90+",
      icon: <Gift className="h-3 w-3" />,
      variant: "destructive",
    },
    {
      id: "4",
      type: "discount",
      title: "15% OFF",
      description: "For orders $19.90+",
      icon: <Gift className="h-3 w-3" />,
      variant: "destructive",
    },
  ],
  colors: [
    { id: "1", color: "#FF6B35", code: "ORG" },
    { id: "2", color: "#B7410E", code: "RST" },
    { id: "3", color: "#000000", code: "BLK" },
    { id: "4", color: "#1B263B", code: "NVY" },
  ],
  sizes: [
    { id: "1", size: "S", code: "SM" },
    { id: "2", size: "M", code: "MD" },
    { id: "3", size: "L", code: "LG" },
    { id: "4", size: "XL", code: "XL" },
    { id: "5", size: "XXL", code: "XXL" },
  ],
  images: [
    {
      id: "1",
      file: "/app-screenshots/landing.png",
      alt_text: "Halloween Sweatshirt - Front View",
      media_type: "image" as const,
    },
    {
      id: "2",
      file: "/orange-sweatshirt-back-view.png",
      alt_text: "Halloween Sweatshirt - Back View",
      media_type: "image" as const,
    },
    {
      id: "3",
      file: "/orange-sweatshirt-detail-view.png",
      alt_text: "Halloween Sweatshirt - Detail View",
      media_type: "image" as const,
    },
    {
      id: "4",
      file: "/orange-sweatshirt-lifestyle.png",
      alt_text: "Halloween Sweatshirt - Lifestyle",
      media_type: "image" as const,
    },
  ],
  inStock: true,
  freeShipping: true,
  specifications: {
    Material: "Cotton Blend",
    Fit: "Regular",
    "Sleeve Length": "Long Sleeve",
    Neckline: "Round Neck",
    "Care Instructions": "Machine wash cold",
    "Country of Origin": "China",
  },
}

const mockReviews = [
  {
    id: "1",
    author: "Sarah M.",
    rating: 5,
    date: "21 Aug 2024",
    title: "Perfect fit and quality!",
    content:
      "T-shirt material, thought it might be like a sweat shirt. I prefer the t-shirt like material a lot. Nice and thick material and doesn't feel cheap. The lettering is dyed rather than a sticker. I feel like this will last me for years. It's also a nice color as well.",
    helpful: 37,
    verified: true,
    size: "L",
    color: "Orange",
    fit: "True to Size",
  },
  {
    id: "2",
    author: "Jessica K.",
    rating: 5,
    date: "15 Aug 2024",
    title: "Love the design and comfort",
    content:
      "Great quality sweatshirt with a fun Halloween design. The material is soft and comfortable, perfect for the fall season. Fits exactly as expected and the print quality is excellent.",
    helpful: 24,
    verified: true,
    size: "M",
    color: "Orange",
    fit: "True to Size",
  },
]

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage(props: ProductPageProps) {
    const { id } = await props.params
    const data = await itemsRead({path:{id:id}})
    const item = data.data
    console.log("item : ",item)
    console.log("id : ",id)
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
              price={Number(item?.variants?.[0].sales_price) || 0}
              originalPrice={Number(item?.variants?.[0].standard_cost) || 0}
              rating={Number.parseFloat(mockProduct.average_rating || "0")}
              reviewCount={item?.review_count || 0}
              description={item?.description || ""}
              shortDescription={item?.short_description}
              colors={mockProduct.colors}
              sizes={mockProduct.sizes}
              inStock={mockProduct.inStock}
              freeShipping={mockProduct.freeShipping}
              specifications={mockProduct.specifications}
              offers={mockProduct.offers}
            />
          </div>
        </div>

        <div className="mt-16">
          <ProductReviews
            rating={Number.parseFloat(mockProduct.average_rating || "0")}
            reviewCount={mockProduct.review_count || 0}
            reviews={mockReviews}
          />
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

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