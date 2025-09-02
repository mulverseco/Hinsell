import { Suspense } from "react"
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server"

// import { getCategories, getFilteredProducts } from "lib/algolia/rate-limited"


import { SearchParamsType } from "types"

import { Breadcrumbs } from "./breadcrumbs"
import { ItemGroup } from "@/core/generated/schemas"
import { cn } from "@/lib/utils"
import { Sorter } from "./filters/sorter"
// import { slugToName } from "utils/slug-name"

interface SearchViewProps {
  searchParams: SearchParamsType
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

function makePageTitle(collection: any | undefined, query: string) {
  if (!!collection) {
    return `${collection.title}`
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
  const { q, sortBy, page, ...rest } = searchParamsCache.parse(searchParams)

  // const filter = buildSearchFilter({
  //   collection,
  //   params: rest,
  //   separator: HIERARCHICAL_SEPARATOR,
  // })

  // const hasVendorFilter = rest.vendors && rest.vendors.length > 0
  // const { facetDistribution, hits, totalPages, totalHits, independentFacetDistribution } = await getFilteredProducts(
  //   q,
  //   sortBy,
  //   page,
  //   filter,
  //   collection?.handle,
  //   hasVendorFilter
  // )

  // const { getPageDisplayTypeByHandle } = await import("utils/get-page-display-type")

  // const { hits: allCategories } = await getCategories({
  //   hitsPerPage: 1000,
  //   attributesToRetrieve: ["handle"],
  // })

  // const categoryDisplayTypes = allCategories.reduce(
  //   (acc, category) => {
  //     acc[category.handle] = getPageDisplayTypeByHandle(category.handle)
  //     return acc
  //   },
  //   {} as Record<string, "CLP" | "PLP">
  // )

  return (
    <div className="mx-auto w-full md:max-w-container-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 overflow-hidden">
        <Breadcrumbs className="mb-8" items={makeBreadcrumbs(collection?.name)} />
      </div>
      <div className="sticky top-[77px] z-40 flex items-center justify-between mx-auto max-w-7xl p-4 backdrop-blur-lg lg:hidden">
        <div className="flex gap-1 text-2xl font-semibold tracking-tight lg:text-3xl">
          <h1 className="flex-1">{collection?.name}</h1>
          <span className="mr-auto text-xl lg:text-2xl">({collection?.parent?.length})</span>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          {/* <FacetsMobile
            disabledFacets={disabledFacets}
            independentFacetDistribution={independentFacetDistribution as Record<string, Record<string, number>>}
            facetDistribution={facetDistribution as Record<string, Record<string, number>>}
            categoryDisplayTypes={categoryDisplayTypes}
          /> */}
        </div>
      </div>
      <div className={cn("flex gap-12 p-4 md:gap-12 mx-auto max-w-7xl ", basePath === "ai" ? "ai-2xl:px-0" : "xl:px-0")}>
        <div className="sticky top-[100px] hidden max-h-[90dvh] w-full px-2 lg:block lg:px-0">
          <div className="flex gap-1 font-semibold">
            <h1 className="text-3xl lg:text-4xl">{collection?.name}</h1>
            <span className="text-2xl">({collection?.parent?.length})</span>
          </div>

          <Suspense>
            {/* <FacetsDesktop
              independentFacetDistribution={independentFacetDistribution as Record<string, Record<string, number>>}
              disabledFacets={disabledFacets}
              className="hidden max-h-[70dvh] shrink-0 basis-[192px] overflow-y-auto lg:block"
              facetDistribution={facetDistribution as Record<string, Record<string, number>>}
              categoryDisplayTypes={categoryDisplayTypes}
            /> */}
          </Suspense>
        </div>
        <div className="w-full">
          <div className="flex justify-end pb-4">
            <Suspense>
              {/* <Sorter className="w-max rounded-md text-sm transition-colors duration-200 hover:bg-gray-100 lg:flex" /> */}
            </Suspense>
          </div>
          {/* <HitsSection hits={hits} basePath={basePath} /> */}
          {/* <PaginationSection queryParams={searchParams} totalPages={totalPages} /> */}
        </div>
      </div>
    </div>
  )
}
