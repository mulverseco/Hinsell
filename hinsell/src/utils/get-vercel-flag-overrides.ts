import { decrypt, type FlagOverridesType } from "@vercel/flags"
import { cookies } from "next/headers"

type Flags = Record<
  Partial<"isVercelAnalyticsEnabled" | "isGoogleTagManagerEnabled" | "isSpeedInsightsEnabled">,
  boolean
>

export async function getVercelFlagOverrides(): Promise<Flags | null> {
  const overridesCookieValue = (await cookies()).get("vercel-flag-overrides")?.value
  const overrides = overridesCookieValue ? ((await decrypt<FlagOverridesType>(overridesCookieValue)) as Flags) : null

  return {
    isVercelAnalyticsEnabled: overrides?.isVercelAnalyticsEnabled ?? process.env.IS_VERCEL_ANALYTICS_ENABLED === "true",
    isGoogleTagManagerEnabled: overrides?.isGoogleTagManagerEnabled ?? process.env.IS_GTM_ENABLED === "true",
    isSpeedInsightsEnabled: overrides?.isSpeedInsightsEnabled ?? process.env.IS_SPEED_INSIGHTS_ENABLED === "true",
  }
}
