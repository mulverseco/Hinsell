import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  OpeningBalancesListResponseSchema,
  OpeningBalancesCreateRequestSchema,
  OpeningBalancesCreateResponseSchema,
  OpeningBalancesReadResponseSchema,
  OpeningBalancesReadParamsSchema,
  OpeningBalancesUpdateRequestSchema,
  OpeningBalancesUpdateResponseSchema,
  OpeningBalancesUpdateParamsSchema,
  OpeningBalancesPartialUpdateRequestSchema,
  OpeningBalancesPartialUpdateResponseSchema,
  OpeningBalancesPartialUpdateParamsSchema,
  OpeningBalancesDeleteResponseSchema,
  OpeningBalancesDeleteParamsSchema
} from '@/core/generated/schemas'

export class OpeningBalancesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'openingBalances-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'openingBalances'
          }
        }
      }
    })
  }

  /**
   * ViewSet for OpeningBalance model.
   * ViewSet for OpeningBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OpeningBalancesListResponseSchema>>>
   * @example
   * const result = await client.openingBalancesList({
   *   config: { timeout: 5000 }
   * })
   */
  openingBalancesList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof OpeningBalancesListResponseSchema>>(
      'GET',
      '/opening-balances/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OpeningBalancesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for OpeningBalance model.
   * ViewSet for OpeningBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OpeningBalancesCreateResponseSchema>>>
   * @example
   * const result = await client.openingBalancesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  openingBalancesCreate = async (options: {
    body: z.infer<typeof OpeningBalancesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OpeningBalancesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof OpeningBalancesCreateResponseSchema>>(
      'POST',
      '/opening-balances/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OpeningBalancesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for OpeningBalance model.
   * ViewSet for OpeningBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OpeningBalancesReadResponseSchema>>>
   * @example
   * const result = await client.openingBalancesRead({
   *   config: { timeout: 5000 }
   * })
   */
  openingBalancesRead = cache(async (options: {
    params: z.infer<typeof OpeningBalancesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await OpeningBalancesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OpeningBalancesReadResponseSchema>>(
      'GET',
      '/opening-balances/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OpeningBalancesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for OpeningBalance model.
   * ViewSet for OpeningBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OpeningBalancesUpdateResponseSchema>>>
   * @example
   * const result = await client.openingBalancesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  openingBalancesUpdate = async (options: {
    params: z.infer<typeof OpeningBalancesUpdateParamsSchema>
    body: z.infer<typeof OpeningBalancesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OpeningBalancesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await OpeningBalancesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OpeningBalancesUpdateResponseSchema>>(
      'PUT',
      '/opening-balances/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OpeningBalancesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for OpeningBalance model.
   * ViewSet for OpeningBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OpeningBalancesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.openingBalancesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  openingBalancesPartialUpdate = async (options: {
    params: z.infer<typeof OpeningBalancesPartialUpdateParamsSchema>
    body: z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OpeningBalancesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await OpeningBalancesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OpeningBalancesPartialUpdateResponseSchema>>(
      'PATCH',
      '/opening-balances/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OpeningBalancesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for OpeningBalance model.
   * ViewSet for OpeningBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OpeningBalancesDeleteResponseSchema>>>
   * @example
   * const result = await client.openingBalancesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  openingBalancesDelete = async (options: {
    params: z.infer<typeof OpeningBalancesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await OpeningBalancesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OpeningBalancesDeleteResponseSchema>>(
      'DELETE',
      '/opening-balances/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OpeningBalancesDeleteResponseSchema
      }
    )
  }
}