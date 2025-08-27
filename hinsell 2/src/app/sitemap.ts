import { env } from "env.mjs"
import { MetadataRoute } from "next"
import { getCategories, getProducts } from "lib/algolia"
import { HITS_PER_PAGE } from "constants/index"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0))

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${env.LIVE_URL}/`,
      lastModified: todayMidnight,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${env.LIVE_URL}/terms-conditions`,
      lastModified: todayMidnight,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${env.LIVE_URL}/privacy-policy`,
      lastModified: todayMidnight,
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ]

  const allHits = (
    await getProducts({
      hitsPerPage: 1000, // Or paginate server-side if needed
      attributesToRetrieve: ["handle", "updatedAt"],
    })
  ).hits

  const allCollections = (
    await getCategories({
      hitsPerPage: 1000,
      attributesToRetrieve: ["handle", "updatedAt"],
    })
  ).hits

  const paginationRoutes: MetadataRoute.Sitemap = Array.from(
    { length: Math.ceil(allHits.length / HITS_PER_PAGE) },
    (_, i) => ({
      url: `${env.LIVE_URL}/search?page=${i + 1}`,
      priority: 0.4,
      changeFrequency: "weekly",
      lastModified: todayMidnight,
    })
  )

  const productRoutes: MetadataRoute.Sitemap = allHits.map((hit) => ({
    url: `${env.LIVE_URL}/product/${hit.handle}`,
    lastModified: hit.updatedAt ? new Date(hit.updatedAt) : todayMidnight,
    priority: 0.6,
    changeFrequency: "weekly",
  }))

  const collectionsRoutes: MetadataRoute.Sitemap = allCollections.map(({ handle, updatedAt }) => ({
    url: `${env.LIVE_URL}/category/${handle}`,
    lastModified: updatedAt ? new Date(updatedAt) : todayMidnight,
    priority: 0.5,
    changeFrequency: "weekly",
  }))

  return [
    ...staticRoutes,
    ...paginationRoutes,
    ...productRoutes,
    ...collectionsRoutes,
  ]
}
