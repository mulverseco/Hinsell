import { Suspense } from "react"
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server"

import { Breadcrumbs } from "./breadcrumbs"
import { ItemGroup, ItemsListParams } from "@/core/generated/schemas"
import { cn } from "@/lib/utils"
import { Sorter } from "./filters/sorter"
import { HitsSection } from "./hits-section"
import { PaginationSection } from "./filters/pagination-section"
import { FacetsDesktop } from "./filters/facets-desktop"
import { FacetsMobile } from "./filters/facets-mobile"
import { itemsList } from "@/core/generated/actions/items"

interface SearchViewProps {
  searchParams: ItemsListParams
  params?: { id: string; page?: string }
  collection?: ItemGroup
  disabledFacets?: string[]
  basePath?: string
}

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sortBy: parseAsString.withDefault(""),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  vendors: parseAsArrayOf(parseAsString).withDefault([]),
  colors: parseAsArrayOf(parseAsString).withDefault([]),
  rating: parseAsInteger,
})


function makePageTitle(collection: string | undefined, query: string) {
  if (!!collection) {
    return `${collection}`
  }

  if (!!query.length) {
    return `${query}`
  }

  return "Search"
}

function makeBreadcrumbs(collection?: string) {
  if (collection) {
    return {
      Home: "/",
      [collection]: "",
    }
  }

  return {
    Home: "/",
    Search: "/search",
  }
}

export async function SearchView({ searchParams, disabledFacets, collection, basePath }: SearchViewProps) {
  const { q, sortBy, page, minPrice, maxPrice, categories, vendors, colors, rating } = searchParamsCache.parse(searchParams)

  const productsResponse = await itemsList({
    query: {

        search: q,
        ordering: sortBy,
        // page,
        // limit: 20,
        // price_min: minPrice,
        // price_max: maxPrice,
        // categories: categories.join(","),
        // vendors: vendors.join(","),
        // colors: colors.join(","),
        // rating_min: rating,
        // category: collection?.id,
    },
  })

  const hits = productsResponse.data || []
  const totalPages = Math.ceil((productsResponse.data?.length || 0) / 20)
  const totalHits = productsResponse.data?.length || 0

    const independentFacetDistribution = {
    categories: {},
    vendors: {},
    colors: {},
  }

  const categoryDisplayTypes = {
    categories: "PLP",
    vendors: "list",
    colors: "color",
  }

  const facetDistribution = {
    categories: categories.reduce((acc, cat) => ({ ...acc, [cat]: Math.floor(Math.random() * 100) }), {}),
    vendors: vendors.reduce((acc, vendor) => ({ ...acc, [vendor]: Math.floor(Math.random() * 50) }), {}),
    colors: colors.reduce((acc, color) => ({ ...acc, [color]: Math.floor(Math.random() * 30) }), {}),
  }

  return (
    <div className="mx-auto w-full md:max-w-container-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 overflow-hidden">
        <Breadcrumbs className="mb-8" items={makeBreadcrumbs(collection?.name)} />
      </div>
      <div className="sticky top-[77px] z-40 flex items-center justify-between mx-auto max-w-7xl p-4 backdrop-blur-lg lg:hidden">
        <div className="flex gap-1 text-2xl font-semibold tracking-tight lg:text-3xl">
          <h1 className="flex-1">{makePageTitle(collection?.name ,query=q)}</h1>
          <span className="mr-auto text-xl lg:text-2xl">({collection?.parent?.length})</span>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <Suspense fallback={<div>Loading filters...</div>}>
          <FacetsMobile
            disabledFacets={disabledFacets}
            independentFacetDistribution={independentFacetDistribution as Record<string, Record<string, number>>}
            facetDistribution={facetDistribution as Record<string, Record<string, number>>}
            categoryDisplayTypes={categoryDisplayTypes}
            />
          </Suspense>
        </div>
      </div>
      <div className={cn("flex gap-12 p-4 md:gap-12 mx-auto max-w-7xl ", basePath === "ai" ? "ai-2xl:px-0" : "xl:px-0")}>
        <div className="sticky top-[100px] hidden max-h-[90dvh] w-full px-2 lg:block lg:px-0">
          <div className="flex gap-1 font-semibold">
            <h1 className="text-3xl lg:text-4xl">{collection?.name}</h1>
            <span className="text-2xl">({collection?.parent?.length})</span>
          </div>

            <Suspense fallback={<div>Loading filters...</div>}>
            <FacetsDesktop
              independentFacetDistribution={independentFacetDistribution as Record<string, Record<string, number>>}
              disabledFacets={disabledFacets}
              className="hidden max-h-[70dvh] shrink-0 basis-[192px] overflow-y-auto lg:block"
              facetDistribution={facetDistribution as Record<string, Record<string, number>>}
              categoryDisplayTypes={categoryDisplayTypes}
            />
          </Suspense>
        </div>
        <div className="w-full">
          <div className="flex justify-end pb-4">
            <Suspense>
              <Sorter className="w-max rounded-md text-sm transition-colors duration-200 hover:bg-gray-100 lg:flex" />
            </Suspense>
          </div>
          <HitsSection hits={hits} basePath={basePath} />
          <PaginationSection queryParams={searchParams} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
