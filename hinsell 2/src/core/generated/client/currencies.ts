import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CurrenciesListResponseSchema,
  CurrenciesCreateRequestSchema,
  CurrenciesCreateResponseSchema,
  CurrenciesReadResponseSchema,
  CurrenciesReadParamsSchema,
  CurrenciesUpdateRequestSchema,
  CurrenciesUpdateResponseSchema,
  CurrenciesUpdateParamsSchema,
  CurrenciesPartialUpdateRequestSchema,
  CurrenciesPartialUpdateResponseSchema,
  CurrenciesPartialUpdateParamsSchema,
  CurrenciesDeleteResponseSchema,
  CurrenciesDeleteParamsSchema
} from '@/core/generated/schemas'

export class CurrenciesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'currencies-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'currencies'
          }
        }
      }
    })
  }

  /**
   * ViewSet for Currency model.
   * ViewSet for Currency model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrenciesListResponseSchema>>>
   * @example
   * const result = await client.currenciesList({
   *   config: { timeout: 5000 }
   * })
   */
  currenciesList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof CurrenciesListResponseSchema>>(
      'GET',
      '/currencies/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrenciesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for Currency model.
   * ViewSet for Currency model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrenciesCreateResponseSchema>>>
   * @example
   * const result = await client.currenciesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  currenciesCreate = async (options: {
    body: z.infer<typeof CurrenciesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CurrenciesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof CurrenciesCreateResponseSchema>>(
      'POST',
      '/currencies/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrenciesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Currency model.
   * ViewSet for Currency model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrenciesReadResponseSchema>>>
   * @example
   * const result = await client.currenciesRead({
   *   config: { timeout: 5000 }
   * })
   */
  currenciesRead = cache(async (options: {
    params: z.infer<typeof CurrenciesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CurrenciesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrenciesReadResponseSchema>>(
      'GET',
      '/currencies/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrenciesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for Currency model.
   * ViewSet for Currency model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrenciesUpdateResponseSchema>>>
   * @example
   * const result = await client.currenciesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  currenciesUpdate = async (options: {
    params: z.infer<typeof CurrenciesUpdateParamsSchema>
    body: z.infer<typeof CurrenciesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CurrenciesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CurrenciesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrenciesUpdateResponseSchema>>(
      'PUT',
      '/currencies/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrenciesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Currency model.
   * ViewSet for Currency model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrenciesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.currenciesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  currenciesPartialUpdate = async (options: {
    params: z.infer<typeof CurrenciesPartialUpdateParamsSchema>
    body: z.infer<typeof CurrenciesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CurrenciesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CurrenciesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrenciesPartialUpdateResponseSchema>>(
      'PATCH',
      '/currencies/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrenciesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Currency model.
   * ViewSet for Currency model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CurrenciesDeleteResponseSchema>>>
   * @example
   * const result = await client.currenciesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  currenciesDelete = async (options: {
    params: z.infer<typeof CurrenciesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CurrenciesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CurrenciesDeleteResponseSchema>>(
      'DELETE',
      '/currencies/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CurrenciesDeleteResponseSchema
      }
    )
  }
}