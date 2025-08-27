import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get language from cookie or detect from headers
  const cookieLocale = request.cookies.get("locale")?.value
  const acceptLanguage = request.headers.get("accept-language")

  const availableLocales = ["en", "sv", "ar"]
  const defaultLocale = "en"

  let locale = defaultLocale

  if (cookieLocale && availableLocales.includes(cookieLocale)) {
    locale = cookieLocale
  } else if (acceptLanguage) {
    // Parse accept-language header
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase())
      .find((lang) => availableLocales.includes(lang.split("-")[0]))

    if (preferredLocale) {
      locale = preferredLocale.split("-")[0]
    }
  }

  const pathnameHasLocale = availableLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (!pathnameHasLocale) {
    const newUrl = new URL(`/${locale}${pathname}`, request.url)
    const response = NextResponse.redirect(newUrl)

    // Set the locale cookie
    response.cookies.set("locale", locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
      sameSite: "lax",
    })

    return response
  }

  const response = NextResponse.next()

  // Set the locale cookie if it's different
  if (cookieLocale !== locale) {
    response.cookies.set("locale", locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
      sameSite: "lax",
    })
  }

  // Add locale to headers for server components
  response.headers.set("x-locale", locale)

  response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
