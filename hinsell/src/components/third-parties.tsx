import { GoogleTagManager } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { getVercelFlagOverrides } from "@/utils/get-vercel-flag-overrides"

export async function ThirdParties() {
  const flags = await getVercelFlagOverrides()

  return (
    <>
      {flags?.isVercelAnalyticsEnabled ? <Analytics /> : null}
      {flags?.isSpeedInsightsEnabled && process.env.NODE_ENV === "production" ? <SpeedInsights /> : null}
      {flags?.isGoogleTagManagerEnabled ? <GoogleTagManager gtmId={process.env.GTM_ID || ""} /> : null}
    </>
  )
}
