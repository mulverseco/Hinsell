import { Suspense } from "react"
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server"

import { Breadcrumbs } from "./breadcrumbs"
import type { ItemGroup, ItemsListParams } from "@/core/generated/schemas"
import { Sorter } from "./filters/sorter"
import { HitsSection } from "./hits-section"
import { PaginationSection } from "./filters/pagination-section"
import { FacetsDesktop } from "./filters/facets-desktop"
import { FacetsMobile } from "./filters/facets-mobile"
import { itemsList } from "@/core/generated/actions/items"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

function makePageTitle(collection: string | undefined, query?: string) {
  if (!!collection) {
    return `${collection}`
  }

  if (!!query?.length) {
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
  const { q, sortBy, page, minPrice, maxPrice, categories, vendors, colors, rating } =
    searchParamsCache.parse(searchParams)

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

  const independentFacetDistribution = productsResponse.facets || {
    categories: {},
    vendors: {},
    colors: {},
  }

  const categoryDisplayTypes = {
    categories: "PLP",
    vendors: "list",
    colors: "color",
  }

  const facetDistribution = productsResponse.facetDistribution || {
    categories: {},
    vendors: {},
    colors: {},
  }

  return (
    <div className="mx-auto w-full">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-4" items={makeBreadcrumbs(collection?.name)} />

        <div className="flex items-center justify-between mb-6">
           <div className="flex gap-1 text-2xl font-semibold tracking-tight lg:text-3xl">
             <h1 className="flex-1">{makePageTitle(collection?.name )}</h1>
             <span className="mr-auto text-xl lg:text-2xl">({collection?.parent?.length})</span>
           </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="lg:hidden bg-transparent">
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort By</span>
              <Suspense>
                <Sorter className="border-none bg-transparent text-sm" />
              </Suspense>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                QuickShip
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                Trends
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:block w-64 pr-8">
          <div className="sticky top-4">
            <Suspense fallback={<div>Loading filters...</div>}>
              <FacetsDesktop
                independentFacetDistribution={independentFacetDistribution as Record<string, Record<string, number>>}
                disabledFacets={disabledFacets}
                className="max-h-[80vh] overflow-y-auto"
                facetDistribution={facetDistribution as Record<string, Record<string, number>>}
                categoryDisplayTypes={categoryDisplayTypes}
              />
            </Suspense>
          </div>
        </div>

        <div className="flex-1">
          <HitsSection hits={hits} basePath={basePath} />
          <PaginationSection queryParams={searchParams} totalPages={totalPages} />
        </div>
      </div>

      <div className="lg:hidden">
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
  )
}
