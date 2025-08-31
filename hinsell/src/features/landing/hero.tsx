"use client"

import { ShoppingBag, Star, TrendingUp } from "lucide-react"
import { CTAButton } from "@/components/shared/cta-button"

const HeroTitle = () => {
  return (
    <div className="relative">
      <h1 className="inline-block max-w-6xl leading-none font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        <div className="relative mb-3 pb-2 text-center text-4xl sm:text-5xl md:mb-5 md:text-6xl">
          <span className="inline-block">DISCOVER AMAZING</span>
        </div>
        <div className="mt-1 block text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="bg-primary text-primary-foreground relative inline-block px-4 py-1">PRODUCTS</span>
          <span className="text-foreground ml-2 inline-block uppercase">& Deals</span>
        </div>
      </h1>
    </div>
  )
}

/**
 * BadgeLabel component for displaying feature announcement badges
 */
const BadgeLabel = ({ text }: { text: string }) => {
  return (
    <div
      className="border-border bg-background mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
      role="note"
    >
      <span className="bg-primary flex h-2 w-2 rounded-full" aria-hidden="true"></span>
      <span className="text-muted-foreground text-xs font-medium">{text}</span>
    </div>
  )
}

/**
 * Main Hero component combining all elements
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden" id="home" aria-labelledby="hero-heading">
      {/* Background elements */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
        aria-hidden="true"
      ></div>
      <div
        className="absolute top-0 right-0 -z-10 h-16 w-16 rounded-full bg-yellow-400/20 blur-2xl md:h-72 md:w-72"
        aria-hidden="true"
      ></div>
      <div
        className="bg-primary/20 absolute bottom-16 left-0 -z-10 h-36 w-36 rounded-full blur-3xl"
        aria-hidden="true"
      ></div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-32 sm:px-6 sm:py-40 md:min-h-screen lg:min-h-screen lg:px-8">
        <div className="flex flex-col items-center text-center">
          <BadgeLabel text="New: Free Shipping on Orders $50+" />

          <HeroTitle />

          <p className="text-muted-foreground mt-8 max-w-2xl text-center text-lg">
            Shop the latest trends with unbeatable prices. From fashion to electronics, find everything you need with
            fast shipping and easy returns.
          </p>

          <div className="relative mt-12 flex flex-col gap-5 sm:flex-row sm:gap-6">
            {/* Decorative elements around buttons */}
            <div
              className="border-primary/30 absolute -top-4 -left-4 h-4 w-4 border-t-2 border-l-2"
              aria-hidden="true"
            ></div>
            <div
              className="border-primary/30 absolute -right-4 -bottom-4 h-4 w-4 border-r-2 border-b-2"
              aria-hidden="true"
            ></div>

            <CTAButton href="/shop" icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}>
              SHOP NOW
            </CTAButton>

            <CTAButton variant="outline" href="/categories">
              BROWSE CATEGORIES
            </CTAButton>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">Free shipping • 30-day returns • Secure checkout</p>

          {/* Stats bar */}
          {/* <div
            className="border-border/50 bg-background/50 mt-16 flex flex-wrap items-center justify-center gap-6 rounded-lg border p-4 sm:gap-10 md:gap-16"
            aria-label="Key statistics"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="text-yellow-500 h-4 w-4 fill-current" aria-hidden="true" />
                <p className="text-lg font-bold">4.8</p>
              </div>
              <p className="text-muted-foreground text-xs">Customer rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-500" aria-hidden="true" />
                <p className="text-lg font-bold">50k+</p>
              </div>
              <p className="text-muted-foreground text-xs">Products available</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-blue-500" aria-hidden="true" />
                <p className="text-lg font-bold">100k+</p>
              </div>
              <p className="text-muted-foreground text-xs">Happy customers</p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
