import { cookies } from "next/headers"
import { headers } from "next/headers"

export async function getServerLocale(): Promise<string> {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Try to get locale from cookie first
  const cookieLocale = cookieStore.get("locale")?.value
  if (cookieLocale) {
    return cookieLocale
  }

  // Fallback to header set by middleware
  const headerLocale = headersList.get("x-locale")
  if (headerLocale) {
    return headerLocale
  }

  return "en" // default fallback
}

export function getClientLocale(): string {
  if (typeof window === "undefined") return "en"

  // Get from cookie
  const cookies = document.cookie.split(";")
  const localeCookie = cookies.find((cookie) => cookie.trim().startsWith("locale="))

  if (localeCookie) {
    return localeCookie.split("=")[1]
  }

  return "en"
}

export function setClientLocale(locale: string) {
  if (typeof window === "undefined") return

  document.cookie = `locale=${locale}; max-age=${365 * 24 * 60 * 60}; path=/; samesite=lax`

  // Reload the page to apply the new locale
  window.location.reload()
}
