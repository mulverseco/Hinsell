import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ItemGroupsListResponseSchema,
  ItemGroupsListParamsSchema,
  ItemGroupsCreateRequestSchema,
  ItemGroupsCreateResponseSchema,
  ItemGroupsReadResponseSchema,
  ItemGroupsReadParamsSchema,
  ItemGroupsUpdateRequestSchema,
  ItemGroupsUpdateResponseSchema,
  ItemGroupsUpdateParamsSchema,
  ItemGroupsPartialUpdateRequestSchema,
  ItemGroupsPartialUpdateResponseSchema,
  ItemGroupsPartialUpdateParamsSchema,
  ItemGroupsDeleteResponseSchema,
  ItemGroupsDeleteParamsSchema
} from '@/core/generated/schemas'

export class ItemGroupsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'itemGroups-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'itemGroups'
          }
        }
      }
    })
  }

  /**
   * ViewSet for ItemGroup model.
   * ViewSet for ItemGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemGroupsListResponseSchema>>>
   * @example
   * const result = await client.itemGroupsList({
   *   config: { timeout: 5000 }
   * })
   */
  itemGroupsList = cache(async (options: {
    params: z.infer<typeof ItemGroupsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemGroupsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemGroupsListResponseSchema>>(
      'GET',
      '/item-groups/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemGroupsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemGroup model.
   * ViewSet for ItemGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemGroupsCreateResponseSchema>>>
   * @example
   * const result = await client.itemGroupsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  itemGroupsCreate = async (options: {
    body: z.infer<typeof ItemGroupsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemGroupsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ItemGroupsCreateResponseSchema>>(
      'POST',
      '/item-groups/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemGroupsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemGroup model.
   * ViewSet for ItemGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemGroupsReadResponseSchema>>>
   * @example
   * const result = await client.itemGroupsRead({
   *   config: { timeout: 5000 }
   * })
   */
  itemGroupsRead = cache(async (options: {
    params: z.infer<typeof ItemGroupsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemGroupsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemGroupsReadResponseSchema>>(
      'GET',
      '/item-groups/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemGroupsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemGroup model.
   * ViewSet for ItemGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemGroupsUpdateResponseSchema>>>
   * @example
   * const result = await client.itemGroupsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemGroupsUpdate = async (options: {
    params: z.infer<typeof ItemGroupsUpdateParamsSchema>
    body: z.infer<typeof ItemGroupsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemGroupsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemGroupsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemGroupsUpdateResponseSchema>>(
      'PUT',
      '/item-groups/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemGroupsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemGroup model.
   * ViewSet for ItemGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemGroupsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.itemGroupsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemGroupsPartialUpdate = async (options: {
    params: z.infer<typeof ItemGroupsPartialUpdateParamsSchema>
    body: z.infer<typeof ItemGroupsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemGroupsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemGroupsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemGroupsPartialUpdateResponseSchema>>(
      'PATCH',
      '/item-groups/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemGroupsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemGroup model.
   * ViewSet for ItemGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemGroupsDeleteResponseSchema>>>
   * @example
   * const result = await client.itemGroupsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  itemGroupsDelete = async (options: {
    params: z.infer<typeof ItemGroupsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemGroupsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemGroupsDeleteResponseSchema>>(
      'DELETE',
      '/item-groups/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemGroupsDeleteResponseSchema
      }
    )
  }
}