import type { Item } from "@/core/generated/schemas"
import { ItemCard } from "./item-card"


interface HitsSectionProps {
  hits: Item[]
  basePath?: string
}

export function HitsSection({ hits, basePath }: HitsSectionProps) {
  if (hits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {hits.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
