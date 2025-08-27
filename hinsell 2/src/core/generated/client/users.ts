import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  UsersListResponseSchema,
  UsersListParamsSchema,
  UsersCreateRequestSchema,
  UsersCreateResponseSchema,
  UsersReadResponseSchema,
  UsersReadParamsSchema,
  UsersUpdateRequestSchema,
  UsersUpdateResponseSchema,
  UsersUpdateParamsSchema,
  UsersPartialUpdateRequestSchema,
  UsersPartialUpdateResponseSchema,
  UsersPartialUpdateParamsSchema,
  UsersDeleteResponseSchema,
  UsersDeleteParamsSchema,
  UsersLoyaltyHistoryResponseSchema,
  UsersLoyaltyHistoryParamsSchema
} from '@/core/generated/schemas'

export class UsersApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'users-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'users'
          }
        }
      }
    })
  }

  /**
   * GET /users/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersListResponseSchema>>>
   * @example
   * const result = await client.usersList({
   *   config: { timeout: 5000 }
   * })
   */
  usersList = cache(async (options: {
    params: z.infer<typeof UsersListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UsersListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UsersListResponseSchema>>(
      'GET',
      '/users/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersListResponseSchema
      }
    )
  })

  /**
   * POST /users/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersCreateResponseSchema>>>
   * @example
   * const result = await client.usersCreate({
   *   config: { timeout: 5000 }
   * })
   */
  usersCreate = async (options: {
    body: z.infer<typeof UsersCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await UsersCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof UsersCreateResponseSchema>>(
      'POST',
      '/users/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersCreateResponseSchema
      }
    )
  }

  /**
   * GET /users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersReadResponseSchema>>>
   * @example
   * const result = await client.usersRead({
   *   config: { timeout: 5000 }
   * })
   */
  usersRead = cache(async (options: {
    params: z.infer<typeof UsersReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UsersReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UsersReadResponseSchema>>(
      'GET',
      '/users/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersReadResponseSchema
      }
    )
  })

  /**
   * PUT /users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersUpdateResponseSchema>>>
   * @example
   * const result = await client.usersUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  usersUpdate = async (options: {
    params: z.infer<typeof UsersUpdateParamsSchema>
    body: z.infer<typeof UsersUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await UsersUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await UsersUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UsersUpdateResponseSchema>>(
      'PUT',
      '/users/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.usersPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  usersPartialUpdate = async (options: {
    params: z.infer<typeof UsersPartialUpdateParamsSchema>
    body: z.infer<typeof UsersPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await UsersPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await UsersPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UsersPartialUpdateResponseSchema>>(
      'PATCH',
      '/users/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /users/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersDeleteResponseSchema>>>
   * @example
   * const result = await client.usersDelete({
   *   config: { timeout: 5000 }
   * })
   */
  usersDelete = async (options: {
    params: z.infer<typeof UsersDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UsersDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UsersDeleteResponseSchema>>(
      'DELETE',
      '/users/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersDeleteResponseSchema
      }
    )
  }

  /**
   * GET /users/{id}/loyalty_history/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UsersLoyaltyHistoryResponseSchema>>>
   * @example
   * const result = await client.usersLoyaltyHistory({
   *   config: { timeout: 5000 }
   * })
   */
  usersLoyaltyHistory = cache(async (options: {
    params: z.infer<typeof UsersLoyaltyHistoryParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UsersLoyaltyHistoryParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UsersLoyaltyHistoryResponseSchema>>(
      'GET',
      '/users/{id}/loyalty_history/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UsersLoyaltyHistoryResponseSchema
      }
    )
  })
}