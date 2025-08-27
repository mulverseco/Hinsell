import { Suspense, useState } from "react"
import { Menu, X } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Autocomplete } from "./autocomplete"
import { Favorites } from "./favorites"
import { Cart } from "./cart"
import { Button } from "../ui/button"

const ProductAddedAlert = dynamic(
  () => import("components/product/product-added-alert").then((mod) => mod.ProductAddedAlert),
  { ssr: false },
)

interface ItemGroup {
  id: string
  name: string
  parent: string | null
}

interface NavigationBarProps {
  ItemGroups: ItemGroup[] | null
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
)

export function NavigationBar({ ItemGroups }: NavigationBarProps) {
  const groups = (Array.isArray(ItemGroups) ? ItemGroups : []) as ItemGroup[]

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
             <Menu />
            </Button>

            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Hinsell
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {groups.map((itemGroup) => (
              <Link
                key={itemGroup.id ?? itemGroup.name}
                href={`/category/plp/${itemGroup.id}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {itemGroup.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <Autocomplete/>

          <div className="flex items-center gap-1">


            <Favorites className="hover:bg-accent transition-colors" />

            <Suspense fallback={<Skeleton className="size-9" />}>
              <Cart className="hover:bg-accent transition-colors" />
            </Suspense>
          </div>
        </div>

          <div className="md:hidden border-t border-border animate-in slide-in-from-top-2 duration-200">
            <nav className="py-4 space-y-1">
              {groups.map((itemGroup) => (
                <Link
                  key={itemGroup.id ?? itemGroup.name}
                  href={`/category/plp/${itemGroup.id}`}
                  className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg mx-2 transition-all duration-200"
                >
                  {itemGroup.name}
                </Link>
              ))}
            </nav>
          </div>
      </div>
      <Suspense fallback={null}>
        <ProductAddedAlert />
      </Suspense>
    </header>
  )
}
