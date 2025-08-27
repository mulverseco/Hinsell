import { Suspense } from "react"
import { notFound } from "next/navigation"
import { slugToName } from "utils/slug-name"
import { type CurrencyType, mapCurrencyToSign } from "utils/map-currency-to-sign"
import {
  getCombinationByMultiOption,
  getCombinationByVisualOption,
  getImagesForCarousel,
  getMultiOptionFromSlug,
  getOriginalOptionValue,
  getVisualOptionFromSlug,
  hasValidMultiOption,
  hasValidVisualOption,
  removeMultiOptionFromSlug,
  removeVisualOptionFromSlug,
} from "utils/visual-variant-utils"

import { Breadcrumbs } from "components/breadcrumbs"

import { FavoriteMarker } from "components/product/favorite-marker"
import { SimilarProductsSection } from "components/product/similar-products-section"
import { SimilarProductsSectionSkeleton } from "components/product/similar-product-section-skeleton"
import { VariantDropdowns } from "components/product/variant-dropdowns"
import { ProductTitle } from "components/product/product-title"
import { ProductImages } from "components/product/product-images"
import { RightSection } from "components/product/right-section"
import { FaqAccordionItem, FaqSectionClient } from "components/product/faq-section/faq-section-client"
import { ShopifyRichText } from "components/product/faq-section/shopify-rich-text"
import { nameToSlug } from "utils/slug-name"
import { AddToCartButton } from "components/product/add-to-cart-button"
import { ReviewsSection } from "components/product/reviews-section"

import { generateJsonLd } from "./metadata"
import { itemsRead } from "@/core/generated/actions/items"
import { Item } from "@/core/generated/schemas"

export const revalidate = 86400
export const dynamic = "force-static"
export const dynamicParams = true

interface ProductProps {
  params: Promise<{ id: string }>
}

export default async function Product(props: ProductProps) {
  const params = await props.params

  const { id } = params

  const multiOptions = getMultiOptionFromSlug(id)
  const baseHandle = Object.keys(multiOptions).length > 0 ? removeMultiOptionFromSlug(id) : removeVisualOptionFromSlug(id)

  const product = await itemsRead({ path: { id: id } })

  if (!product?.data) {
    return notFound()
  }

  const item: Item = product.data

  let combination
  const hasInvalidOptions = false

  // if (Object.keys(multiOptions).length > 0) {
  //   hasInvalidOptions = !hasValidMultiOption(item.units?.[0]?.name || "", multiOptions)
  //   combination = getCombinationByMultiOption(item.units, multiOptions)
  // } else {
  //   const visualValue = getVisualOptionFromSlug(id)
  //   hasInvalidOptions = !hasValidVisualOption(item.units || [], visualValue)
  //   combination = getCombinationByVisualOption(item.units, visualValue)
  // }

  if (hasInvalidOptions) {
    return notFound()
  }

  const combinationPrice = combination?.unit_price || item.sales_price || null

  let visualValue: string | null = null
  if (Object.keys(multiOptions).length > 0) {
    if (multiOptions.color) {
      // visualValue = getOriginalOptionValue(item?.units, "color", multiOptions.color)
    }
    if (!visualValue && Object.keys(multiOptions).length > 0) {
      const firstOption = Object.entries(multiOptions)[0]
      // visualValue = getOriginalOptionValue(item?.units, firstOption[0], firstOption[1])
    }
  } else {
    visualValue = getVisualOptionFromSlug(id)
  }

  const { images: imagesToShow, activeIndex } = getImagesForCarousel(item?.media || [], visualValue)

  return (
    <div className="relative mx-auto max-w-container-md px-4 xl:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(item, id)) }}
      ></script>
      <div className="mb:pb-8 relative flex w-full items-center justify-center gap-10 py-4 md:pt-12">
        <div className="mx-auto w-full max-w-container-sm">
          <Breadcrumbs className="mb-8" items={makeBreadcrumbs(item)} />
        </div>
      </div>
      <main className="mx-auto max-w-container-sm">
        <div className="grid grid-cols-1 gap-4 md:mx-auto md:max-w-screen-xl md:grid-cols-12 md:gap-8">
          <ProductTitle
            className="md:hidden"
            title={item.name || ""}
            price={combinationPrice}
            currency={combination?.price ? mapCurrencyToSign(combination.price?.currencyCode as CurrencyType) : "$"}
          />
          <ProductImages key={id} images={imagesToShow} initialActiveIndex={activeIndex} />
          <RightSection className="md:col-span-6 md:col-start-8 md:mt-0">
            <ProductTitle
              className="hidden md:col-span-4 md:col-start-9 md:block"
              title={item.name || ""}
              price={combinationPrice}
              currency={combination?.price ? mapCurrencyToSign(combination.price?.currencyCode as CurrencyType) : "$"}
            />
            {item.units && item.units.length > 1 && (
              <VariantDropdowns
                variants={item.units}
                handle={item.slug || id}
                combination={combination}
                currentSlug={id}
              />
            )}
            <p>{item.description || item.short_description}</p>
            <AddToCartButton className="mt-4" product={item} combination={combination} />
            <FavoriteMarker handle={id} />
            <FaqSectionClient defaultOpenSections={[nameToSlug(getDefaultFaqAccordionItemValue()[0])]}>
              {/* <FaqAccordionItem title={getDefaultFaqAccordionItemValue()[0]} >
                <ShopifyRichText
                  data={item.internal_notes || getDefaultFaqAccordionItemRichText()}
                  className="prose prose-sm max-w-none"
                />
              </FaqAccordionItem> */}
              <FaqAccordionItem title="Size and Fit">
                <p>
                  {item.size && `Size: ${item.size}. `}
                  {item.weight && `Weight: ${item.weight}. `}
                  Est veniam qui aute nisi occaecat ad non velit anim commodo sit proident. Labore sint officia nostrud
                  eu est fugiat nulla velit sint commodo. Excepteur sit ut anim pariatur minim adipisicing dolore sit
                  dolore cupidatat. Amet reprehenderit ipsum aute minim incididunt adipisicing est.
                </p>
              </FaqAccordionItem>
              <FaqAccordionItem title="Free Delivery and Returns">
                <p>
                  Aliqua Lorem ullamco officia cupidatat cupidatat. Nostrud occaecat ex in Lorem. Et occaecat
                  adipisicing do aliquip duis aliquip enim culpa nulla. Nulla quis aute ex eu est ullamco enim
                  incididunt fugiat proident laboris. Laboris sint ad et nostrud velit fugiat fugiat proident enim sit
                  irure elit. Ut amet elit labore cupidatat id consectetur sint fugiat esse excepteur pariatur. Tempor
                  pariatur dolor eiusmod proident ad incididunt officia labore fugiat consectetur. Sunt veniam officia
                  officia eiusmod minim incididunt est sit esse excepteur non cupidatat voluptate ea. Do excepteur sunt
                  nostrud eu do id nisi dolore laboris ea ullamco magna eu. Eiusmod irure dolore amet velit laboris
                  excepteur cupidatat est cupidatat minim ut anim id. Deserunt velit ex exercitation consequat quis
                  magna pariatur laboris elit minim eiusmod anim.
                </p>
              </FaqAccordionItem>
              <FaqAccordionItem title="Supplier Information">
                <p>
                  {item.manufacturer && `Manufacturer: ${item.manufacturer}. `}
                  {item.brand && `Brand: ${item.brand}. `}
                  Aliqua ut ex irure eu officia dolore velit et occaecat pariatur excepteur nostrud ad. Ea reprehenderit
                  sint culpa excepteur adipisicing ipsum esse excepteur officia culpa adipisicing nostrud. Nulla Lorem
                  voluptate tempor officia id mollit do est amet dolor nulla. Sint sunt consequat non in reprehenderit
                  Lorem velit enim cillum enim. Consequat occaecat exercitation consequat nisi veniam. Ipsum est
                  reprehenderit cupidatat nulla minim anim deserunt consequat ipsum anim ea tempor.
                </p>
              </FaqAccordionItem>
            </FaqSectionClient>
          </RightSection>
        </div>
        <Suspense>
          <ReviewsSection
            avgRating={item.average_rating || ""}
            productHandle={item.slug || id}
            productId={item.id || id}
            summary={item.review_count ? `${item.review_count} reviews` : undefined}
          />
        </Suspense>
        <Suspense fallback={<SimilarProductsSectionSkeleton />}>
          <SimilarProductsSection objectID={item.id || id} slug={id} />
        </Suspense>
      </main>
    </div>
  )
}

function makeBreadcrumbs(item: Item) {
  const itemGroup = item.item_group

  return {
    Home: "/",
    [itemGroup?.name ? slugToName(itemGroup.name) : "Products"]: itemGroup?.slug
      ? `/category/${itemGroup.id}`
      : "/search",
    [item.name || ""]: "",
  }
}

function getDefaultFaqAccordionItemRichText() {
  return '{"type":"root","children":[{"listType":"unordered","type":"list","children":[{"type":"list-item","children":[{"type":"text","value":"Super for the muscles"}]},{"type":"list-item","children":[{"type":"text","value":"Various types and color variants"}]},{"type":"list-item","children":[{"type":"text","value":"Outdoor, or indoor - you define the place where you want to exercise"}]},{"type":"list-item","children":[{"type":"text","value":"100% Plastic from "},{"type":"text","value":"recycling the materials","bold":true}]}]}]}'
}

function getDefaultFaqAccordionItemValue() {
  return ["Product Details"]
}
