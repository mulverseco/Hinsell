import { NextRequest, NextResponse } from "next/server"

export const facetParams = [
  "q",
  "minPrice",
  "maxPrice",
  "sortBy",
  "categories",
  "vendors",
  "tags",
  "colors",
  "sizes",
  "rating",
] as const

type RedirectEntry = {
  destination: string
  permanent: boolean
}

type Route = {
  page: string
  cookie: string
}

const ROUTES: Record<string, Route | undefined> = {
  "/": {
    page: "/home",
    cookie: "bucket-home",
  },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /** ----------------
   *  1. Locale handling
   * ----------------- */
  const cookieLocale = request.cookies.get("locale")?.value
  const acceptLanguage = request.headers.get("accept-language")

  const availableLocales = ["en", "sv", "ar"]
  const defaultLocale = "en"

  let locale = cookieLocale && availableLocales.includes(cookieLocale)
    ? cookieLocale
    : defaultLocale

  if (!cookieLocale && acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase())
      .find((lang) => availableLocales.includes(lang.split("-")[0]))
    if (preferredLocale) {
      locale = preferredLocale.split("-")[0]
    }
  }

  const pathnameHasLocale = availableLocales.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`,
  )

  if (!pathnameHasLocale) {
    const newUrl = new URL(`/${locale}${pathname}`, request.url)
    const response = NextResponse.redirect(newUrl)
    response.cookies.set("locale", locale, { maxAge: 31536000, httpOnly: false, sameSite: "lax" })
    return response
  }

  /** ----------------
   *  2. Redirects
   * ----------------- */
  const homeAwarePathname = pathname === "/" ? "/home" : pathname

  if (homeAwarePathname in ROUTES) {
    const redirectResponse = await handleRedirectsMiddleware(request)
    if (redirectResponse) return redirectResponse
  }

  /** ----------------
   *  4. CLP / PLP Handling
   * ----------------- */
  if (isCLP(request)) return handleCLPMiddleware(request)
  if (isPLP(request)) return handlePLPMiddleware(request)

  /** ----------------
   *  5. Default response (add headers + locale cookie)
   * ----------------- */
  const response = NextResponse.next()
  response.cookies.set("locale", locale, { maxAge: 31536000, httpOnly: false, sameSite: "lax" })
  response.headers.set("x-locale", locale)

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")

  // Cache control (avoid caching HTML for 1 year)
  if (pathname.startsWith("/_next/static")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  } else {
    response.headers.set("Cache-Control", "no-store")
  }

  return response
}

/* -----------------
 * Redirect Handling
 * ----------------- */
async function handleRedirectsMiddleware(request: NextRequest) {
  const api = new URL(
    `/api/redirects?pathname=${encodeURIComponent(request.nextUrl.pathname)}`,
    request.nextUrl.origin,
  )

  try {
    const redirectData = await fetch(api)

    if (redirectData.ok) {
      const redirectEntry = (await redirectData.json()) as RedirectEntry | undefined
      if (redirectEntry) {
        const statusCode = redirectEntry.permanent ? 308 : 307
        return NextResponse.redirect(new URL(redirectEntry.destination, request.nextUrl.origin), statusCode)
      }
    }
  } catch (error) {
    console.error("Redirect middleware error:", error)
  }
}


/* -----------------
 * CLP / PLP Handling
 * ----------------- */
function handleCLPMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const segments = url.pathname.split("/").filter(Boolean) // ["en", "category", "2ebb268d-..."]
  const locale = segments[0]
  const categoryId = segments[2]
  const page = url.searchParams.get("page")

  if (page) {
    url.pathname = `/${locale}/category/clp/${categoryId}/${page}`
    url.searchParams.delete("page")
    return NextResponse.rewrite(url)
  }

  url.pathname = `/${locale}/category/clp/${categoryId}`
  return NextResponse.rewrite(url)
}

function handlePLPMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const segments = url.pathname.split("/").filter(Boolean) // ["en", "category", "2ebb268d-..."]
  const locale = segments[0]
  const categoryId = segments[2]

  url.pathname = `/${locale}/category/plp/${categoryId}`
  return NextResponse.rewrite(url)
}


/* -----------------
 * Config
 * ----------------- */
export const config = {
  unstable_allowDynamic: ["**/node_modules/lodash/lodash.js", "**/node_modules/reflect-metadata/Reflect.js"],
  matcher: ["/", "/((?!api|_next|cache-healthcheck|health|_vercel|.*\\..*).*)"],
}

/* -----------------
 * Helpers
 * ----------------- */
function getPathWithoutLocale(pathname: string, availableLocales: string[]): string {
  for (const loc of availableLocales) {
    if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
      return pathname.slice(loc.length + 1) || "/"
    }
  }
  return pathname
}

function isCLP(request: NextRequest): boolean {
  const availableLocales = ["en", "sv", "ar"]
  const cleanPath = getPathWithoutLocale(request.nextUrl.pathname, availableLocales)

  const isCategory = cleanPath.startsWith("/category/")
  const isInternalRoute =
    cleanPath.startsWith("/category/clp/") ||
    cleanPath.includes("/clp") ||
    cleanPath.includes("/plp")

  const isFaceted = facetParams.some((param) => request.nextUrl.searchParams.has(param))

  return isCategory && !isFaceted && !isInternalRoute
}

function isPLP(request: NextRequest): boolean {
  const availableLocales = ["en", "sv", "ar"]
  const cleanPath = getPathWithoutLocale(request.nextUrl.pathname, availableLocales)

  const isCategory = cleanPath.startsWith("/category/")
  const isInternalRoute =
    cleanPath.startsWith("/category/plp/") ||
    cleanPath.includes("/clp") ||
    cleanPath.includes("/plp")

  const isFaceted = facetParams.some((param) => request.nextUrl.searchParams.has(param))

  return isCategory && isFaceted && !isInternalRoute
}

