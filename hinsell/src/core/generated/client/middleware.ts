// Client utilities and middleware
import 'server-only'
import type { RequestMiddleware, RequestConfiguration, ClientResponse } from './base'

// Logging middleware
export const loggingMiddleware: RequestMiddleware = {
  name: 'logging',
  onRequest: async (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method} ${config.url || 'unknown'}`)
    }
    return config
  },
  onResponse: async (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response ${response.status} (${response.responseTime}ms)`)
    }
    return response
  },
  onError: async (error) => {
    console.error(`[API] Error: ${error.message}`, error)
    throw error
  }
}

// Retry middleware with exponential backoff
export const retryMiddleware = (maxRetries = 3, baseDelay = 1000): RequestMiddleware => ({
  name: 'retry',
  onError: async (error) => {
    // This would be handled by the base client's retry logic
    throw error
  }
})

// Cache middleware
export const cacheMiddleware = (ttl = 300): RequestMiddleware => ({
  name: 'cache',
  onRequest: async (config) => {
    // Add cache headers
    return {
      ...config,
      headers: {
        ...config.headers,
        'Cache-Control': `max-age=${ttl}`
      }
    }
  }
})

// Compression middleware
export const compressionMiddleware: RequestMiddleware = {
  name: 'compression',
  onRequest: async (config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Accept-Encoding': 'gzip, deflate, br'
      }
    }
  }
}

// Request timing middleware
export const timingMiddleware: RequestMiddleware = {
  name: 'timing',
  onRequest: async (config) => {
    (config as any)._startTime = Date.now()
    return config
  },
  onResponse: async (response) => {
    const startTime = (response as any)._startTime
    if (startTime) {
      response.responseTime = Date.now() - startTime
    }
    return response
  }
}

// Content type middleware
export const contentTypeMiddleware: RequestMiddleware = {
  name: 'content-type',
  onRequest: async (config) => {
    // Auto-detect content type based on body
    if (config.body) {
      if (config.body instanceof FormData) {
        // Don't set content-type for FormData (browser handles it)
        const headers = { ...config.headers }
        delete headers['Content-Type']
        return { ...config, headers }
      } else if (config.body instanceof URLSearchParams) {
        return {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      } else if (typeof config.body === 'object') {
        return {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      }
    }
    return config
  }
}

// Rate limiting middleware
export const rateLimitMiddleware = (requestsPerMinute = 60): RequestMiddleware => {
  const requests = new Map<string, number[]>()
  
  return {
    name: 'rate-limit',
    onRequest: async (config) => {
      const now = Date.now()
      const minute = Math.floor(now / 60000)
      const key = `${config.method}:${config.url}`
      
      const requestTimes = requests.get(key) || []
      const recentRequests = requestTimes.filter(time => time === minute)
      
      if (recentRequests.length >= requestsPerMinute) {
        throw new Error(`Rate limit exceeded: ${requestsPerMinute} requests per minute`)
      }
      
      requestTimes.push(minute)
      requests.set(key, requestTimes.slice(-requestsPerMinute))
      
      return config
    }
  }
}

// Default middleware stack
export const defaultMiddleware: RequestMiddleware[] = [
  timingMiddleware,
  contentTypeMiddleware,
  compressionMiddleware,
  loggingMiddleware
]

// Utility functions
export function createMiddlewareStack(...middleware: RequestMiddleware[]): RequestMiddleware[] {
  return [...defaultMiddleware, ...middleware]
}

export function withMiddleware<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  middleware: RequestMiddleware[]
): T {
  return (async (...args: any[]) => {
    // This would integrate with the base client's middleware system
    return fn(...args)
  }) as T
}