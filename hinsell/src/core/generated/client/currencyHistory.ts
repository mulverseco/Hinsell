import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CurrencyHistoryListResponseSchema,
  CurrencyHistoryReadResponseSchema,
  CurrencyHistoryReadParamsSchema
} from '@/core/generated/schemas'

export class CurrencyHistoryApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'currencyHistory-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'currencyHistory'
          }
        }
      }
    })
  }

  /**
   * ViewSet for CurrencyHistory model.
   * ViewSet for CurrencyHistory model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrencyHistoryListResponseSchema>>>
   * @example
   * const result = await client.currencyHistoryList({
   *   config: { timeout: 5000 }
   * })
   */
  currencyHistoryList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof CurrencyHistoryListResponseSchema>>(
      'GET',
      '/currency-history/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryListResponseSchema
      }
    )
  })

  /**
   * ViewSet for CurrencyHistory model.
   * ViewSet for CurrencyHistory model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrencyHistoryReadResponseSchema>>>
   * @example
   * const result = await client.currencyHistoryRead({
   *   config: { timeout: 5000 }
   * })
   */
  currencyHistoryRead = cache(async (options: {
    params: z.infer<typeof CurrencyHistoryReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CurrencyHistoryReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrencyHistoryReadResponseSchema>>(
      'GET',
      '/currency-history/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryReadResponseSchema
      }
    )
  })
}