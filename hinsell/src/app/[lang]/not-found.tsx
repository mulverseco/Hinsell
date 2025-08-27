import { CTAButton } from "@/components/shared/cta-button"
import { ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
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
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-2xl text-neutral-600 dark:text-neutral-500">Page not found</p>
      <p className="mt-2 text-lg text-neutral-500 dark:text-neutral-300">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <CTAButton
        href="/"
        icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
        >
        GO TO HOMEPAGE
      </CTAButton>
    </div>
  )
}
