import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "components/ui/carousel"
import { ProductCard } from "components/product-card"
import { itemsItemRecommendations } from "@/core/generated/actions/items"

interface SimilarProductsSectionProps {
  slug: string
  objectID: string
  basePath?: string
}

export async function SimilarProductsSection({ slug, objectID, basePath }: SimilarProductsSectionProps) {
  const items = await itemsItemRecommendations({path:{id : objectID}})

  console.log("items : ",items  )


  return (
    <section className="my-10">
      <h2 className="mb-10 text-[26px] font-medium tracking-[-0.78px]">Similar products</h2>
      <Carousel
        opts={{
          align: "start",
          skipSnaps: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items?.data?.recommendations.premium_alternatives.map((product, idx) => (
            <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4" key={"featured_" + product.id + idx}>
              <ProductCard
                href={basePath ? `/${basePath}/product/${product.id}` : undefined}
                prefetch
                item={product}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 top-1/2 hidden shadow-sm md:flex" />
        <CarouselNext className="-right-4 top-1/2 hidden shadow-sm md:flex" />
      </Carousel>
    </section>
  )
}
