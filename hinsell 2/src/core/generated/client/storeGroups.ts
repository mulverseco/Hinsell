import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  StoreGroupsListResponseSchema,
  StoreGroupsListParamsSchema,
  StoreGroupsCreateRequestSchema,
  StoreGroupsCreateResponseSchema,
  StoreGroupsReadResponseSchema,
  StoreGroupsReadParamsSchema,
  StoreGroupsUpdateRequestSchema,
  StoreGroupsUpdateResponseSchema,
  StoreGroupsUpdateParamsSchema,
  StoreGroupsPartialUpdateRequestSchema,
  StoreGroupsPartialUpdateResponseSchema,
  StoreGroupsPartialUpdateParamsSchema,
  StoreGroupsDeleteResponseSchema,
  StoreGroupsDeleteParamsSchema
} from '@/core/generated/schemas'

export class StoreGroupsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'storeGroups-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'storeGroups'
          }
        }
      }
    })
  }

  /**
   * ViewSet for StoreGroup model.
   * ViewSet for StoreGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof StoreGroupsListResponseSchema>>>
   * @example
   * const result = await client.storeGroupsList({
   *   config: { timeout: 5000 }
   * })
   */
  storeGroupsList = cache(async (options: {
    params: z.infer<typeof StoreGroupsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await StoreGroupsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof StoreGroupsListResponseSchema>>(
      'GET',
      '/store-groups/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: StoreGroupsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for StoreGroup model.
   * ViewSet for StoreGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof StoreGroupsCreateResponseSchema>>>
   * @example
   * const result = await client.storeGroupsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  storeGroupsCreate = async (options: {
    body: z.infer<typeof StoreGroupsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await StoreGroupsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof StoreGroupsCreateResponseSchema>>(
      'POST',
      '/store-groups/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: StoreGroupsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for StoreGroup model.
   * ViewSet for StoreGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof StoreGroupsReadResponseSchema>>>
   * @example
   * const result = await client.storeGroupsRead({
   *   config: { timeout: 5000 }
   * })
   */
  storeGroupsRead = cache(async (options: {
    params: z.infer<typeof StoreGroupsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await StoreGroupsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof StoreGroupsReadResponseSchema>>(
      'GET',
      '/store-groups/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: StoreGroupsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for StoreGroup model.
   * ViewSet for StoreGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof StoreGroupsUpdateResponseSchema>>>
   * @example
   * const result = await client.storeGroupsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  storeGroupsUpdate = async (options: {
    params: z.infer<typeof StoreGroupsUpdateParamsSchema>
    body: z.infer<typeof StoreGroupsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await StoreGroupsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await StoreGroupsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof StoreGroupsUpdateResponseSchema>>(
      'PUT',
      '/store-groups/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: StoreGroupsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for StoreGroup model.
   * ViewSet for StoreGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof StoreGroupsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.storeGroupsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  storeGroupsPartialUpdate = async (options: {
    params: z.infer<typeof StoreGroupsPartialUpdateParamsSchema>
    body: z.infer<typeof StoreGroupsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await StoreGroupsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await StoreGroupsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof StoreGroupsPartialUpdateResponseSchema>>(
      'PATCH',
      '/store-groups/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: StoreGroupsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for StoreGroup model.
   * ViewSet for StoreGroup model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof StoreGroupsDeleteResponseSchema>>>
   * @example
   * const result = await client.storeGroupsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  storeGroupsDelete = async (options: {
    params: z.infer<typeof StoreGroupsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await StoreGroupsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof StoreGroupsDeleteResponseSchema>>(
      'DELETE',
      '/store-groups/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: StoreGroupsDeleteResponseSchema
      }
    )
  }
}