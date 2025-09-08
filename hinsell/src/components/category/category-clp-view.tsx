import { notFound } from "next/navigation"
import type { SearchParamsType } from "types"
import { CategoryLandingPage } from "./category-landing-page"
import { itemGroupsRead } from "@/core/generated/actions/itemGroups"
import { itemsList } from "@/core/generated/actions/items"

interface CategoryCLPViewProps {
  params: { id: string; page?: string }
  searchParams?: SearchParamsType
  basePath?: string
}

export async function CategoryCLPView({ params, basePath, searchParams = {} }: CategoryCLPViewProps) {
  const [collection, products] = await Promise.all([
    itemGroupsRead({ path: { id: params.id } }),
    itemsList({
      params: {
        query: {
          search: searchParams.q || "",
          ordering: searchParams.sortBy || "",
          category: params.id, // Filter by category
          page: searchParams.page || 1,
          limit: 20, // Add pagination
        },
      },
    }),
  ])

  console.log("[v0] Collection data:", collection?.data?.name)
  console.log("[v0] Products count:", products?.data?.results?.length || 0)

  if (!collection?.data) return notFound()

  return (
    <CategoryLandingPage
      collection={collection.data}
      products={products.data ?? []}
      basePath={basePath}
      totalCount={products.data?.length || 0}
      hasNextPage={!!products.data}
    />
  )
}
