import type { Metadata } from "next"
import { CategoryCLPView } from "components/category/category-clp-view"
import { SearchParamsType } from "types"

export const revalidate = 86400

export const dynamic = "force-dynamic"

interface CategoryPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParamsType>
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
    title: `${params.id} | Enterprise Commerce`,
    description: "In excepteur elit mollit in.",
  }
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  return <CategoryCLPView params={params} searchParams={searchParams} />
}
