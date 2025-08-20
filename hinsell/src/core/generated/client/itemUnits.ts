import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ItemUnitsListResponseSchema,
  ItemUnitsListParamsSchema,
  ItemUnitsCreateRequestSchema,
  ItemUnitsCreateResponseSchema,
  ItemUnitsReadResponseSchema,
  ItemUnitsReadParamsSchema,
  ItemUnitsUpdateRequestSchema,
  ItemUnitsUpdateResponseSchema,
  ItemUnitsUpdateParamsSchema,
  ItemUnitsPartialUpdateRequestSchema,
  ItemUnitsPartialUpdateResponseSchema,
  ItemUnitsPartialUpdateParamsSchema,
  ItemUnitsDeleteResponseSchema,
  ItemUnitsDeleteParamsSchema
} from '@/core/generated/schemas'

export class ItemUnitsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'itemUnits-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'itemUnits'
          }
        }
      }
    })
  }

  /**
   * ViewSet for ItemUnit model.
   * ViewSet for ItemUnit model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemUnitsListResponseSchema>>>
   * @example
   * const result = await client.itemUnitsList({
   *   config: { timeout: 5000 }
   * })
   */
  itemUnitsList = cache(async (options: {
    params: z.infer<typeof ItemUnitsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemUnitsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemUnitsListResponseSchema>>(
      'GET',
      '/item-units/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemUnitsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemUnit model.
   * ViewSet for ItemUnit model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemUnitsCreateResponseSchema>>>
   * @example
   * const result = await client.itemUnitsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  itemUnitsCreate = async (options: {
    body: z.infer<typeof ItemUnitsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemUnitsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ItemUnitsCreateResponseSchema>>(
      'POST',
      '/item-units/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemUnitsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemUnit model.
   * ViewSet for ItemUnit model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemUnitsReadResponseSchema>>>
   * @example
   * const result = await client.itemUnitsRead({
   *   config: { timeout: 5000 }
   * })
   */
  itemUnitsRead = cache(async (options: {
    params: z.infer<typeof ItemUnitsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemUnitsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemUnitsReadResponseSchema>>(
      'GET',
      '/item-units/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemUnitsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemUnit model.
   * ViewSet for ItemUnit model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemUnitsUpdateResponseSchema>>>
   * @example
   * const result = await client.itemUnitsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemUnitsUpdate = async (options: {
    params: z.infer<typeof ItemUnitsUpdateParamsSchema>
    body: z.infer<typeof ItemUnitsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemUnitsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemUnitsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemUnitsUpdateResponseSchema>>(
      'PUT',
      '/item-units/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemUnitsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemUnit model.
   * ViewSet for ItemUnit model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemUnitsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.itemUnitsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemUnitsPartialUpdate = async (options: {
    params: z.infer<typeof ItemUnitsPartialUpdateParamsSchema>
    body: z.infer<typeof ItemUnitsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemUnitsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemUnitsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemUnitsPartialUpdateResponseSchema>>(
      'PATCH',
      '/item-units/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemUnitsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemUnit model.
   * ViewSet for ItemUnit model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemUnitsDeleteResponseSchema>>>
   * @example
   * const result = await client.itemUnitsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  itemUnitsDelete = async (options: {
    params: z.infer<typeof ItemUnitsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemUnitsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemUnitsDeleteResponseSchema>>(
      'DELETE',
      '/item-units/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemUnitsDeleteResponseSchema
      }
    )
  }
}