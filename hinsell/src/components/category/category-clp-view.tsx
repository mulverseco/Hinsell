import { notFound } from "next/navigation"
import { SearchParamsType } from "types"
import { CategoryLandingPage } from "./category-landing-page"
import { SearchView } from "components/search-view"
import { getPageDisplayTypeByHandle } from "utils/get-page-display-type"
import { itemGroupsRead } from "@/core/generated/actions/itemGroups"
import { itemsList } from "@/core/generated/actions/items"

interface CategoryCLPViewProps {
  params: { id: string; page?: string }
  searchParams?: SearchParamsType
  basePath?: string
}

export async function CategoryCLPView({ params, basePath, searchParams = {} }: CategoryCLPViewProps) {
  const collection = await itemGroupsRead({ path: { id: params.id } })

  if (!collection?.data) return notFound()

  // const pageDisplayType = getPageDisplayTypeByHandle(params.id)

  // const shouldShowCLP = pageDisplayType === "CLP"

  // if (!shouldShowCLP) {
  //   return <SearchView searchParams={searchParams} params={params} collection={collection} basePath={basePath} />
  // }

  const products = await itemsList({ query: { search: collection.data?.id } })

  return (
    <CategoryLandingPage collection={collection.data } products={products.data ?? []} basePath={basePath} />
  )
}
