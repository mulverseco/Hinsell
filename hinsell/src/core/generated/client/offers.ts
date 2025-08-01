import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  OffersListResponseSchema,
  OffersListParamsSchema,
  OffersCreateRequestSchema,
  OffersCreateResponseSchema,
  OffersReadResponseSchema,
  OffersReadParamsSchema,
  OffersUpdateRequestSchema,
  OffersUpdateResponseSchema,
  OffersUpdateParamsSchema,
  OffersPartialUpdateRequestSchema,
  OffersPartialUpdateResponseSchema,
  OffersPartialUpdateParamsSchema,
  OffersDeleteResponseSchema,
  OffersDeleteParamsSchema,
  OffersApplyRequestSchema,
  OffersApplyResponseSchema,
  OffersApplyParamsSchema
} from '@/core/generated/schemas'

export class OffersApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'offers-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'offers'
          }
        }
      }
    })
  }

  /**
   * GET /offers/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersListResponseSchema>>>
   * @example
   * const result = await client.offersList({
   *   config: { timeout: 5000 }
   * })
   */
  offersList = cache(async (options: {
    params: z.infer<typeof OffersListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await OffersListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OffersListResponseSchema>>(
      'GET',
      '/offers/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersListResponseSchema
      }
    )
  })

  /**
   * POST /offers/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersCreateResponseSchema>>>
   * @example
   * const result = await client.offersCreate({
   *   config: { timeout: 5000 }
   * })
   */
  offersCreate = async (options: {
    body: z.infer<typeof OffersCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OffersCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof OffersCreateResponseSchema>>(
      'POST',
      '/offers/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersCreateResponseSchema
      }
    )
  }

  /**
   * GET /offers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersReadResponseSchema>>>
   * @example
   * const result = await client.offersRead({
   *   config: { timeout: 5000 }
   * })
   */
  offersRead = cache(async (options: {
    params: z.infer<typeof OffersReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await OffersReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OffersReadResponseSchema>>(
      'GET',
      '/offers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersReadResponseSchema
      }
    )
  })

  /**
   * PUT /offers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersUpdateResponseSchema>>>
   * @example
   * const result = await client.offersUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  offersUpdate = async (options: {
    params: z.infer<typeof OffersUpdateParamsSchema>
    body: z.infer<typeof OffersUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OffersUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await OffersUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OffersUpdateResponseSchema>>(
      'PUT',
      '/offers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /offers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.offersPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  offersPartialUpdate = async (options: {
    params: z.infer<typeof OffersPartialUpdateParamsSchema>
    body: z.infer<typeof OffersPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OffersPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await OffersPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OffersPartialUpdateResponseSchema>>(
      'PATCH',
      '/offers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /offers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersDeleteResponseSchema>>>
   * @example
   * const result = await client.offersDelete({
   *   config: { timeout: 5000 }
   * })
   */
  offersDelete = async (options: {
    params: z.infer<typeof OffersDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await OffersDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OffersDeleteResponseSchema>>(
      'DELETE',
      '/offers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersDeleteResponseSchema
      }
    )
  }

  /**
   * Apply an offer to a given price and quantity.
   * Apply an offer to a given price and quantity.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof OffersApplyResponseSchema>>>
   * @example
   * const result = await client.offersApply({
   *   config: { timeout: 5000 }
   * })
   */
  offersApply = async (options: {
    params: z.infer<typeof OffersApplyParamsSchema>
    body: z.infer<typeof OffersApplyRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await OffersApplyRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await OffersApplyParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof OffersApplyResponseSchema>>(
      'POST',
      '/offers/{id}/apply/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: OffersApplyResponseSchema
      }
    )
  }
}