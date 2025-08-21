import { Item } from "@/core/generated/schemas"

export function generateJsonLd(item: Item, slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description || item.short_description,
    image: item.media?.map((media) => media.file).filter(Boolean) || [],
    ...(item.brand && {
      brand: {
        "@type": "Brand",
        name: item.brand,
      },
    }),
    ...(item.manufacturer && {
      manufacturer: {
        "@type": "Organization",
        name: item.manufacturer,
      },
    }),
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
    offers: {
      "@type": "Offer",
      price: item.sales_price || item.wholesale_price || "0",
      priceCurrency: "USD",
      itemCondition: "https://schema.org/NewCondition",
      // availability:
      //   item.maximum_stock && item.maximum_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${baseUrl}/product/${slug}`,
    },
    ...(item.average_rating &&
      item.review_count && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: item.average_rating,
          reviewCount: item.review_count,
        },
      }),
    sku: item.code,
    gtin: item.barcodes?.[0]?.barcode,
    ...(item.weight && {
      weight: {
        "@type": "QuantitativeValue",
        value: item.weight,
        unitCode: "KGM",
      },
    }),
    color: item.color,
    size: item.size,
    category: item.item_group?.name,
    url: `${baseUrl}/product/${slug}`,
  }
}
