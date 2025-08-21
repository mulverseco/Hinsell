"use client"

import { Button } from "components/ui/button-old"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <div className="flex min-h-screen flex-col items-center justify-center gap-10 ">
          <>
            <h1 className="text-6xl font-bold">Something went wrong!</h1>
            <pre className="mt-2 text-lg">{JSON.stringify(error, null, 2)}</pre>
            <Button variant="secondary" size="xl" className="text-[22px] hover:text-white" onClick={() => reset()}>
              Try again
            </Button>
          </>
      </div>
    </div>
  )
}
