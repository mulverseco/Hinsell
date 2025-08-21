import { EnterpriseCategoryCard } from "components/enterprise-category-card"
import { itemGroupsList } from "@/core/generated/actions/itemGroups"

export async function EnterpriseCategoriesSection() {
const itemGroups  = itemGroupsList({})

  return (
    <section className="relative w-full py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Featured Categories</h2>
          <p className="mt-4 text-lg text-muted-foreground">Explore our curated collections</p>
        </div>

        {}
        <div className="relative -mx-4 sm:-mx-8 lg:-mx-12">
          <div className="px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              {(await itemGroups).data.map((category, index) => (
                <div key={category.id} className="aspect-[4/3] w-full">
                  <EnterpriseCategoryCard category={category} priority={index < 2} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
