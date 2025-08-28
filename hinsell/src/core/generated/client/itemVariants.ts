import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ItemVariantsListResponseSchema,
  ItemVariantsListParamsSchema,
  ItemVariantsCreateRequestSchema,
  ItemVariantsCreateResponseSchema,
  ItemVariantsReadResponseSchema,
  ItemVariantsReadParamsSchema,
  ItemVariantsUpdateRequestSchema,
  ItemVariantsUpdateResponseSchema,
  ItemVariantsUpdateParamsSchema,
  ItemVariantsPartialUpdateRequestSchema,
  ItemVariantsPartialUpdateResponseSchema,
  ItemVariantsPartialUpdateParamsSchema,
  ItemVariantsDeleteResponseSchema,
  ItemVariantsDeleteParamsSchema
} from '@/core/generated/schemas'

export class ItemVariantsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'itemVariants-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'itemVariants'
          }
        }
      }
    })
  }

  /**
   * ViewSet for ItemVariant model.
   * ViewSet for ItemVariant model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemVariantsListResponseSchema>>>
   * @example
   * const result = await client.itemVariantsList({
   *   config: { timeout: 5000 }
   * })
   */
  itemVariantsList = cache(async (options: {
    params: z.infer<typeof ItemVariantsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemVariantsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemVariantsListResponseSchema>>(
      'GET',
      '/item-variants/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemVariantsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemVariant model.
   * ViewSet for ItemVariant model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemVariantsCreateResponseSchema>>>
   * @example
   * const result = await client.itemVariantsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  itemVariantsCreate = async (options: {
    body: z.infer<typeof ItemVariantsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemVariantsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ItemVariantsCreateResponseSchema>>(
      'POST',
      '/item-variants/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemVariantsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemVariant model.
   * ViewSet for ItemVariant model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemVariantsReadResponseSchema>>>
   * @example
   * const result = await client.itemVariantsRead({
   *   config: { timeout: 5000 }
   * })
   */
  itemVariantsRead = cache(async (options: {
    params: z.infer<typeof ItemVariantsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemVariantsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemVariantsReadResponseSchema>>(
      'GET',
      '/item-variants/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemVariantsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemVariant model.
   * ViewSet for ItemVariant model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemVariantsUpdateResponseSchema>>>
   * @example
   * const result = await client.itemVariantsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemVariantsUpdate = async (options: {
    params: z.infer<typeof ItemVariantsUpdateParamsSchema>
    body: z.infer<typeof ItemVariantsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemVariantsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemVariantsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemVariantsUpdateResponseSchema>>(
      'PUT',
      '/item-variants/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemVariantsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemVariant model.
   * ViewSet for ItemVariant model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemVariantsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.itemVariantsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemVariantsPartialUpdate = async (options: {
    params: z.infer<typeof ItemVariantsPartialUpdateParamsSchema>
    body: z.infer<typeof ItemVariantsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemVariantsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemVariantsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemVariantsPartialUpdateResponseSchema>>(
      'PATCH',
      '/item-variants/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemVariantsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemVariant model.
   * ViewSet for ItemVariant model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemVariantsDeleteResponseSchema>>>
   * @example
   * const result = await client.itemVariantsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  itemVariantsDelete = async (options: {
    params: z.infer<typeof ItemVariantsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemVariantsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemVariantsDeleteResponseSchema>>(
      'DELETE',
      '/item-variants/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemVariantsDeleteResponseSchema
      }
    )
  }
}