"use client"

import { ProductCard } from "components/product-card"
import { Item } from "@/core/generated/schemas"
import { useRef } from "react"

export const ModernNewArrivalsSection = ({ products }: { products: Item[] }) => {
  const productRefs = useRef<(HTMLDivElement | null)[]>([])

  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            New Arrivals
          </h2>
          <p className="mt-2 text-base text-muted-foreground lg:text-lg">Fresh styles, just dropped</p>
        </div>

        {}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                productRefs.current[index] = el
              }}
              className="group relative"
            >
         
                <div className="relative overflow-hidden rounded-lg bg-secondary/5 transition-all duration-300 hover:bg-secondary/10">
                  <ProductCard
                    item={product}
                    prefetch={false}
                    priority={index < 4}
                    className="border-0 bg-transparent hover:bg-transparent"
                  />
                  {}
                  {index < 3 && (
                    <div className="absolute left-3 top-3 z-10">
                      <span className="inline-flex items-center rounded-full bg-foreground px-2 py-1 text-xs font-medium text-background">
                        NEW
                      </span>
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>

        {}
        <div className="mt-12 text-center">
          <a
            href="/search?sort=created_at"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 transition-all hover:underline"
          >
            View all new arrivals
            <svg
              className="size-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
