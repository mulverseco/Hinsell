import Link from "next/link"
import { cn } from "utils/cn"

export function AnnouncementBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[40px] w-full items-center justify-center text-nowrap bg-gradient-to-t from-white to-[#fce26a] text-center text-base/[25px] text-black",
        className
      )}
    >
      Sale 50% OFF
      <Link prefetch={false} href="/search" className="ml-2 underline hover:no-underline">
        Shop Now
      </Link>
    </div>
  )
}
