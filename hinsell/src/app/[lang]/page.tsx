import { CTA } from "@/features/landing/cta";
import { Features } from "@/features/landing/features";
import { Hero } from "@/features/landing/hero";
import { Pricing } from "@/features/landing/pricing";
import { Testimonials } from "@/features/landing/testimonials";

export const revalidate = 86400
export const dynamic = "force-static"
export const dynamicParams = true

export default async function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
    </>
  );
}
