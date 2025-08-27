// The HTTP client is automatically created by " @mulverse/bridge "
import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { after } from 'next/server'

// Types and interfaces
export interface RequestConfiguration extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: Error, attempt: number) => boolean
  validateResponse?: boolean
  responseSchema?: z.ZodSchema<any>
  skipAuth?: boolean
  skipCache?: boolean
  cacheKey?: string
  cacheTags?: string[]
  revalidate?: number | false
  middleware?: RequestMiddleware[]
  onUploadProgress?: (progress: ProgressEvent) => void
  onDownloadProgress?: (progress: ProgressEvent) => void
}

export interface ClientResponse<TData = any> {
  data: TData
  status: number
  statusText: string
  headers: Headers
  cached?: boolean
  retryCount?: number
  responseTime?: number
  requestId?: string
  fromCache?: boolean
}

export interface RequestMiddleware {
  name: string
  onRequest?: (config: RequestConfiguration) => Promise<RequestConfiguration> | RequestConfiguration
  onResponse?: <T>(response: ClientResponse<T>) => Promise<ClientResponse<T>> | ClientResponse<T>
  onError?: (error: ApiError) => Promise<never> | never
}

export interface RequestMetrics {
  requestId: string
  method: string
  url: string
  startTime: number
  endTime?: number
  duration?: number
  status?: number
  cached?: boolean
  retryCount?: number
  error?: string
}

// Enhanced error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly response?: Response,
    public readonly data?: any,
    public readonly requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isRetryable(): boolean {
    return this.isServerError || this.isNetworkError || this.status === 429
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodError,
    public readonly requestId?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeout: number,
    public readonly requestId?: string
  ) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly requestId?: string
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>()

// Metrics collection
const metricsCollector = {
  requests: new Map<string, RequestMetrics>(),
  
  startRequest(requestId: string, method: string, url: string): void {
    this.requests.set(requestId, {
      requestId,
      method,
      url,
      startTime: Date.now()
    })
  },
  
  endRequest(requestId: string, status?: number, cached?: boolean, retryCount?: number, error?: string): void {
    const metrics = this.requests.get(requestId)
    if (metrics) {
      metrics.endTime = Date.now()
      metrics.duration = metrics.endTime - metrics.startTime
      metrics.status = status
      metrics.cached = cached
      metrics.retryCount = retryCount
      metrics.error = error
      
      // Send metrics in background
      after(async () => {
        await this.sendMetrics(metrics)
      })
    }
  },
  
  async sendMetrics(metrics: RequestMetrics): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API_METRICS]', metrics)
    }
    
    // In production, send to your analytics service
    // await analytics.track('api_request', metrics)
  }
}

export class BaseApiClient {
  private readonly baseUrl: string
  private readonly defaultTimeout: number
  private readonly defaultRetries: number
  private readonly defaultHeaders: Record<string, string>
  private readonly middleware: RequestMiddleware[] = []

  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'https://hinsell.mulverse.com/api'
    this.defaultTimeout = 30000
    this.defaultRetries = 3
    this.defaultHeaders = {}
    
    // Add default middleware
    this.addMiddleware({
      name: 'request-id',
      onRequest: this.addRequestId.bind(this)
    })
    
    this.addMiddleware({
      name: 'security-headers',
      onRequest: this.addSecurityHeaders.bind(this)
    })
  }

  // Middleware management
  addMiddleware(middleware: RequestMiddleware): void {
    this.middleware.push(middleware)
  }

  removeMiddleware(name: string): void {
    const index = this.middleware.findIndex(m => m.name === name)
    if (index > -1) {
      this.middleware.splice(index, 1)
    }
  }

  // Enhanced authentication
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const getAuthHeaders: Record<string, string> = {}
    
    try {
      // Get auth token from various sources
      const cookieStore = await cookies()
      const headersList = await headers()
      
      // Try cookie first
      const tokenFromCookie = cookieStore.get('auth-token')?.value
      if (tokenFromCookie) {
        getAuthHeaders.Authorization = `Bearer ${tokenFromCookie}`
        return getAuthHeaders
      }
      
      // Try header
      const tokenFromHeader = headersList.get('authorization')
      if (tokenFromHeader) {
        getAuthHeaders.Authorization = tokenFromHeader
        return getAuthHeaders
      }
      
      // Try external auth service
      // No external auth configured
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    const secureApiKey = process.env.NEXT_SECURE_API_KEY
    if (secureApiKey) {
      getAuthHeaders["Authorization"] =  `Api-Key ${secureApiKey}`    }
    
    return getAuthHeaders
  }

  // Security headers middleware
  private async addSecurityHeaders(config: RequestConfiguration): Promise<RequestConfiguration> {
    const headersList = await headers()
    const securityHeaders: Record<string, string> = {}
    
    // CSRF protection
    const csrfToken = headersList.get('x-csrf-token')
    if (csrfToken) {
      securityHeaders['X-CSRF-Token'] = csrfToken
    }
    
    // Request origin
    const origin = headersList.get('origin')
    if (origin) {
      securityHeaders['Origin'] = origin
    }
    
    // User agent
    const userAgent = headersList.get('user-agent')
    if (userAgent) {
      securityHeaders['User-Agent'] = userAgent
    }
    
    return {
      ...config,
      headers: {
        ...config.headers,
        ...securityHeaders
      }
    }
  }

  // Request ID middleware
  private async addRequestId(config: RequestConfiguration): Promise<RequestConfiguration> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Request-ID': requestId
      }
    }
  }

  // Enhanced URL building with validation
  private buildUrl(
    path: string, 
    pathParameters: Record<string, string> = {}, 
    queryParameters: Record<string, any> = {}
  ): string {
    let url = path
    
    // Replace path parameters with validation
    for (const [key, value] of Object.entries(pathParameters)) {
      if (!value) {
        throw new ValidationError(`Missing required path parameter: ${key}`, {} as z.ZodError)
      }
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)))
    }
    
    // Validate no unreplaced parameters remain
    const unreplacedParams = url.match(/{[^}]+}/g)
    if (unreplacedParams) {
      throw new ValidationError(
        `Unreplaced path parameters: ${unreplacedParams.join(', ')}`,
        {} as z.ZodError
      )
    }
    
    // Add query parameters with proper encoding
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(queryParameters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value))
        } else {
          searchParams.append(key, String(value))
        }
      }
    }
    
    const queryString = searchParams.toString()
    const fullUrl = `${this.baseUrl}${url}${queryString ? `?${queryString}` : ''}`
    
    // URL validation
    try {
      new URL(fullUrl)
    } catch {
      throw new ValidationError(`Invalid URL constructed: ${fullUrl}`, {} as z.ZodError)
    }
    
    return fullUrl
  }

  // Enhanced request execution with caching and deduplication
  private async executeRequest<TData>(
    method: HttpMethod,
    path: string,
    options: {
      pathParams?: Record<string, string>
      queryParams?: Record<string, any>
      body?: any
      headers?: Record<string, string>
      config?: RequestConfiguration
      responseSchema?: z.ZodSchema<TData>
    } = {}
  ): Promise<ClientResponse<TData>> {
    const {
      pathParams = {},
      queryParams = {},
      body,
      headers = {},
      config = {},
      responseSchema
    } = options

    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000,
      retryCondition = (error: Error, attempt: number) => {
        if (error instanceof ApiError) {
          return error.isRetryable && attempt < retries
        }
        return attempt < retries
      },
      validateResponse = true,
      skipAuth = false,
      skipCache = false,
      cacheKey,
      cacheTags = [],
      revalidate = 300,
      middleware = [],
      ...fetchOptions
    } = config

    const url = this.buildUrl(path, pathParams, queryParams)
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Start metrics collection
    metricsCollector.startRequest(requestId, method, url)

    // Request deduplication for GET requests
    if (method === 'GET' && !skipCache) {
      const dedupeKey = cacheKey || `${method}:${url}`
      const existingRequest = requestCache.get(dedupeKey)
      
      if (existingRequest) {
        console.log(`[DEDUPE] Using existing request for ${dedupeKey}`)
        const result = await existingRequest
        metricsCollector.endRequest(requestId, result.status, true)
        return { ...result, fromCache: true, requestId }
      }
      
      // Cache the promise
      const requestPromise = this.executeRequestInternal<TData>(
        method, url, body, headers, fetchOptions, timeout, retries, 
        retryDelay, retryCondition, validateResponse, skipAuth, 
        responseSchema, requestId, [...this.middleware, ...middleware]
      )
      
      requestCache.set(dedupeKey, requestPromise)
      
      // Clean up cache after request completes
      requestPromise.finally(() => {
        requestCache.delete(dedupeKey)
      })
      
      return requestPromise
    }

    return this.executeRequestInternal<TData>(
      method, url, body, headers, fetchOptions, timeout, retries,
      retryDelay, retryCondition, validateResponse, skipAuth,
      responseSchema, requestId, [...this.middleware, ...middleware]
    )
  }

  // Internal request execution with middleware support
  private async executeRequestInternal<TData>(
    method: HttpMethod,
    url: string,
    body: any,
    headers: Record<string, string>,
    fetchOptions: RequestInit,
    timeout: number,
    retries: number,
    retryDelay: number,
    retryCondition: (error: Error, attempt: number) => boolean,
    validateResponse: boolean,
    skipAuth: boolean,
    responseSchema?: z.ZodSchema<TData>,
    requestId?: string,
    middleware: RequestMiddleware[] = []
  ): Promise<ClientResponse<TData>> {
    const startTime = Date.now()

    // Build initial request configuration
    let requestConfig: RequestConfiguration = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.defaultHeaders,
        ...(skipAuth ? {} : await this.getAuthHeaders()),
        ...headers
      },
      ...fetchOptions
    }

    // Apply request middleware
    for (const mw of middleware) {
      if (mw.onRequest) {
        requestConfig = await mw.onRequest(requestConfig)
      }
    }

    // Add body for non-GET requests
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body instanceof FormData || body instanceof URLSearchParams) {
        requestConfig.body = body
        // Remove content-type for FormData (browser sets it with boundary)
        if (body instanceof FormData) {
          delete (requestConfig.headers as Record<string, string>)['Content-Type']
        }
      } else {
        requestConfig.body = JSON.stringify(body)
      }
    }

    // Execute with retries and middleware
    let lastError: Error = new Error('Unknown error')
    let retryCount = 0
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, timeout)
        
        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response)
          const apiError = new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response.statusText,
            response,
            errorData,
            requestId
          )

          // Apply error middleware
          for (const mw of middleware) {
            if (mw.onError) {
              await mw.onError(apiError)
            }
          }

          throw apiError
        }

        // Parse response
        const data = await this.parseResponse<TData>(response, responseSchema, validateResponse)

        let clientResponse: ClientResponse<TData> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          retryCount,
          responseTime,
          requestId
        }

        // Apply response middleware
        for (const mw of middleware) {
          if (mw.onResponse) {
            clientResponse = await mw.onResponse(clientResponse)
          }
        }

        // End metrics collection
        metricsCollector.endRequest(requestId!, response.status, false, retryCount)

        return clientResponse
      } catch (error) {
        lastError = error as Error
        retryCount = attempt

        // Check if we should retry
        if (attempt < retries && retryCondition(lastError, attempt)) {
          // Exponential backoff with jitter
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        break
      }
    }

    // End metrics collection with error
    metricsCollector.endRequest(
      requestId!, 
      undefined, 
      false, 
      retryCount, 
      lastError.message
    )

    // Enhance error with context
    if (lastError instanceof Error && lastError.name === 'AbortError') {
      throw new TimeoutError(`Request timeout after ${timeout}ms`, timeout, requestId)
    }

    if (lastError instanceof TypeError && lastError.message.includes('fetch')) {
      throw new NetworkError('Network request failed', lastError, requestId)
    }

    throw lastError
  }

  // Enhanced response parsing with streaming support
  private async parseResponse<TData>(
    response: Response,
    schema?: z.ZodSchema<TData>,
    shouldValidate = true
  ): Promise<TData> {
    const contentType = response.headers.get('content-type') || ''
    let data: any

    // Handle different content types
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (contentType.includes('text/')) {
      data = await response.text()
    } else if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf')) {
      data = await response.blob()
    } else if (contentType.includes('multipart/form-data')) {
      data = await response.formData()
    } else {
      // Try JSON first, fallback to text
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }
    }

    // Validate response if schema provided
    if (shouldValidate && schema) {
      try {
        return await schema.parseAsync(data)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError('Response validation failed', error)
        }
        throw error
      }
    }

    return data
  }

  // Enhanced error response parsing
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        return await response.json()
      } else if (contentType.includes('text/')) {
        const text = await response.text()
        return { message: text }
      } else {
        return { message: response.statusText }
      }
    } catch {
      return { message: response.statusText || 'Unknown error' }
    }
  }

  // Public method for making requests with caching
  async request<TData>(
    method: HttpMethod,
    path: string,
    options?: {
      pathParams?: Record<string, string>
      queryParams?: Record<string, any>
      body?: any
      headers?: Record<string, string>
      config?: RequestConfiguration
      responseSchema?: z.ZodSchema<TData>
    }
  ): Promise<ClientResponse<TData>> {
    return this.executeRequest(method, path, options)
  }

  // Cached convenience methods
async get<TData>(
  path: string, 
  options?: Omit<Parameters<typeof this.request>[2], 'body'>
): Promise<ClientResponse<TData>> {
  return cache(async () => {
    return this.request<TData>('GET', path, options)
  })()
}

  async post<TData>(
    path: string, 
    body?: any, 
    options?: Omit<Parameters<typeof this.request>[2], 'body'>
  ): Promise<ClientResponse<TData>> {
    return this.request('POST', path, { ...options, body })
  }

  async put<TData>(
    path: string, 
    body?: any, 
    options?: Omit<Parameters<typeof this.request>[2], 'body'>
  ): Promise<ClientResponse<TData>> {
    return this.request('PUT', path, { ...options, body })
  }

  async patch<TData>(
    path: string, 
    body?: any, 
    options?: Omit<Parameters<typeof this.request>[2], 'body'>
  ): Promise<ClientResponse<TData>> {
    return this.request('PATCH', path, { ...options, body })
  }

  async delete<TData>(
    path: string, 
    options?: Omit<Parameters<typeof this.request>[2], 'body'>
  ): Promise<ClientResponse<TData>> {
    return this.request('DELETE', path, options)
  }

  // Utility methods
  clearCache(): void {
    requestCache.clear()
  }

  getMetrics(): Map<string, RequestMetrics> {
    return new Map(metricsCollector.requests)
  }
}