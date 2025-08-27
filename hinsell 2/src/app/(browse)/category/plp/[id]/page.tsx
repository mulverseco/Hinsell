import type { Metadata } from "next"
import { SearchParamsType } from "types"
import { CategoryPLPView } from "components/category/category-plp-view"

export const runtime = "nodejs"
export const revalidate = 86400

export const dynamic = "force-dynamic"

interface ProductListingPageProps {
  searchParams: Promise<SearchParamsType>
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: ProductListingPageProps): Promise<Metadata> {
  const params = await props.params
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
    title: `${params.id} | Enterprise Commerce`,
    description: "In excepteur elit mollit in.",
  }
}


export default async function ProductListingPage(props: ProductListingPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  return <CategoryPLPView params={params} searchParams={searchParams} />
}
