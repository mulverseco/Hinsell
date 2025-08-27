import { notFound } from "next/navigation"
import { SearchParamsType } from "types"
import { SearchView } from "components/search-view"
import { itemGroupsRead } from "@/core/generated/actions/itemGroups";

interface CategoryPLPViewProps {
  params: { id: string; page?: string }
  searchParams?: SearchParamsType
  basePath?: string
}

export async function CategoryPLPView({ params, searchParams = {}, basePath }: CategoryPLPViewProps) {
  const collection = await itemGroupsRead({ path: { id: params.id } })

  if (!collection) return notFound()

  return <SearchView searchParams={searchParams} params={params} collection={collection.data} basePath={basePath} />
}
