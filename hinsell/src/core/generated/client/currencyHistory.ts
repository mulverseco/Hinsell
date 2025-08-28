import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CurrencyHistoryListResponseSchema,
  CurrencyHistoryListParamsSchema,
  CurrencyHistoryCreateRequestSchema,
  CurrencyHistoryCreateResponseSchema,
  CurrencyHistoryReadResponseSchema,
  CurrencyHistoryReadParamsSchema,
  CurrencyHistoryUpdateRequestSchema,
  CurrencyHistoryUpdateResponseSchema,
  CurrencyHistoryUpdateParamsSchema,
  CurrencyHistoryPartialUpdateRequestSchema,
  CurrencyHistoryPartialUpdateResponseSchema,
  CurrencyHistoryPartialUpdateParamsSchema,
  CurrencyHistoryDeleteResponseSchema,
  CurrencyHistoryDeleteParamsSchema
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
  currencyHistoryList = cache(async (options: {
    params: z.infer<typeof CurrencyHistoryListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CurrencyHistoryListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrencyHistoryListResponseSchema>>(
      'GET',
      '/currency-history/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryListResponseSchema
      }
    )
  })

  /**
   * ViewSet for CurrencyHistory model.
   * ViewSet for CurrencyHistory model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrencyHistoryCreateResponseSchema>>>
   * @example
   * const result = await client.currencyHistoryCreate({
   *   config: { timeout: 5000 }
   * })
   */
  currencyHistoryCreate = async (options: {
    body: z.infer<typeof CurrencyHistoryCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CurrencyHistoryCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof CurrencyHistoryCreateResponseSchema>>(
      'POST',
      '/currency-history/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryCreateResponseSchema
      }
    )
  }

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

  /**
   * ViewSet for CurrencyHistory model.
   * ViewSet for CurrencyHistory model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrencyHistoryUpdateResponseSchema>>>
   * @example
   * const result = await client.currencyHistoryUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  currencyHistoryUpdate = async (options: {
    params: z.infer<typeof CurrencyHistoryUpdateParamsSchema>
    body: z.infer<typeof CurrencyHistoryUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CurrencyHistoryUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CurrencyHistoryUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrencyHistoryUpdateResponseSchema>>(
      'PUT',
      '/currency-history/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for CurrencyHistory model.
   * ViewSet for CurrencyHistory model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrencyHistoryPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.currencyHistoryPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  currencyHistoryPartialUpdate = async (options: {
    params: z.infer<typeof CurrencyHistoryPartialUpdateParamsSchema>
    body: z.infer<typeof CurrencyHistoryPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CurrencyHistoryPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CurrencyHistoryPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrencyHistoryPartialUpdateResponseSchema>>(
      'PATCH',
      '/currency-history/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for CurrencyHistory model.
   * ViewSet for CurrencyHistory model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrencyHistoryDeleteResponseSchema>>>
   * @example
   * const result = await client.currencyHistoryDelete({
   *   config: { timeout: 5000 }
   * })
   */
  currencyHistoryDelete = async (options: {
    params: z.infer<typeof CurrencyHistoryDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CurrencyHistoryDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrencyHistoryDeleteResponseSchema>>(
      'DELETE',
      '/currency-history/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrencyHistoryDeleteResponseSchema
      }
    )
  }
}