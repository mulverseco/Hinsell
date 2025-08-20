import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ItemsListResponseSchema,
  ItemsListParamsSchema,
  ItemsCreateRequestSchema,
  ItemsCreateResponseSchema,
  ItemsReadResponseSchema,
  ItemsReadParamsSchema,
  ItemsUpdateRequestSchema,
  ItemsUpdateResponseSchema,
  ItemsUpdateParamsSchema,
  ItemsPartialUpdateRequestSchema,
  ItemsPartialUpdateResponseSchema,
  ItemsPartialUpdateParamsSchema,
  ItemsDeleteResponseSchema,
  ItemsDeleteParamsSchema
} from '@/core/generated/schemas'

export class ItemsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'items-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'items'
          }
        }
      }
    })
  }

  /**
   * ViewSet for Item model.
   * ViewSet for Item model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemsListResponseSchema>>>
   * @example
   * const result = await client.itemsList({
   *   config: { timeout: 5000 }
   * })
   */
  itemsList = cache(async (options: {
    params: z.infer<typeof ItemsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemsListResponseSchema>>(
      'GET',
      '/items/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for Item model.
   * ViewSet for Item model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemsCreateResponseSchema>>>
   * @example
   * const result = await client.itemsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  itemsCreate = async (options: {
    body: z.infer<typeof ItemsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ItemsCreateResponseSchema>>(
      'POST',
      '/items/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Item model.
   * ViewSet for Item model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemsReadResponseSchema>>>
   * @example
   * const result = await client.itemsRead({
   *   config: { timeout: 5000 }
   * })
   */
  itemsRead = cache(async (options: {
    params: z.infer<typeof ItemsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemsReadResponseSchema>>(
      'GET',
      '/items/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for Item model.
   * ViewSet for Item model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemsUpdateResponseSchema>>>
   * @example
   * const result = await client.itemsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemsUpdate = async (options: {
    params: z.infer<typeof ItemsUpdateParamsSchema>
    body: z.infer<typeof ItemsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemsUpdateResponseSchema>>(
      'PUT',
      '/items/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Item model.
   * ViewSet for Item model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.itemsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemsPartialUpdate = async (options: {
    params: z.infer<typeof ItemsPartialUpdateParamsSchema>
    body: z.infer<typeof ItemsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemsPartialUpdateResponseSchema>>(
      'PATCH',
      '/items/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Item model.
   * ViewSet for Item model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemsDeleteResponseSchema>>>
   * @example
   * const result = await client.itemsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  itemsDelete = async (options: {
    params: z.infer<typeof ItemsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemsDeleteResponseSchema>>(
      'DELETE',
      '/items/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemsDeleteResponseSchema
      }
    )
  }
}