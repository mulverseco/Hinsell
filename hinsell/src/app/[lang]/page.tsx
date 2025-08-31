import { itemsList } from "@/core/generated/actions/items";
import { offersList } from "@/core/generated/actions/offers";
import { CTA } from "@/features/landing/cta";
import { Features } from "@/features/landing/features";
import { Hero } from "@/features/landing/hero";
import { Pricing } from "@/features/landing/pricing";
import { PromotionalBar } from "@/features/landing/promotional-bar";
import { Testimonials } from "@/features/landing/testimonials";
import { Suspense } from "react";

export const revalidate = 86400
export const dynamic = "force-static"
export const dynamicParams = true

export default async function Home() {
  const items = await itemsList({})

  // const offersData = await offersList({
  //     query: {
  //       search: "",
  //       ordering: "-created_at",
  //     },
  // })

  // const activeOffer = offersData?.data?.find(
  //   (offer: any) => offer.is_active && new Date(offer.end_date) > new Date(),
  // )

  return (
    <>
    {/* <Suspense fallback={null}>
      <PromotionalBar offer={activeOffer} />
    </Suspense> */}
      <Hero />
      <Features initialItem={items.data} />
      <Pricing />
      <Testimonials />
      <CTA />
    </>
  );
}
