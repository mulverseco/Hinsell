"use client"

import { CTAButton } from "@/components/shared/cta-button";
import { RotateCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-10">
          <h1 className="text-6xl font-bold">Something went wrong!</h1>
          <pre className="mt-2 text-lg text-neutral-500 dark:text-neutral-300">{JSON.stringify(error, null, 2)}</pre>
            <CTAButton
              onClick={() => reset()}
              icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
            >
              TRY AGAIN
            </CTAButton>
        </div>
      </body>
    </html>
  )
}
