import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  UserCouponsListResponseSchema,
  UserCouponsListParamsSchema,
  UserCouponsCreateRequestSchema,
  UserCouponsCreateResponseSchema,
  UserCouponsReadResponseSchema,
  UserCouponsReadParamsSchema,
  UserCouponsUpdateRequestSchema,
  UserCouponsUpdateResponseSchema,
  UserCouponsUpdateParamsSchema,
  UserCouponsPartialUpdateRequestSchema,
  UserCouponsPartialUpdateResponseSchema,
  UserCouponsPartialUpdateParamsSchema,
  UserCouponsDeleteResponseSchema,
  UserCouponsDeleteParamsSchema
} from '@/core/generated/schemas'

export class UserCouponsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'userCoupons-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'userCoupons'
          }
        }
      }
    })
  }

  /**
   * GET /user-coupons/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UserCouponsListResponseSchema>>>
   * @example
   * const result = await client.userCouponsList({
   *   config: { timeout: 5000 }
   * })
   */
  userCouponsList = cache(async (options: {
    params: z.infer<typeof UserCouponsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UserCouponsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UserCouponsListResponseSchema>>(
      'GET',
      '/user-coupons/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UserCouponsListResponseSchema
      }
    )
  })

  /**
   * POST /user-coupons/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UserCouponsCreateResponseSchema>>>
   * @example
   * const result = await client.userCouponsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  userCouponsCreate = async (options: {
    body: z.infer<typeof UserCouponsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await UserCouponsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof UserCouponsCreateResponseSchema>>(
      'POST',
      '/user-coupons/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UserCouponsCreateResponseSchema
      }
    )
  }

  /**
   * GET /user-coupons/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UserCouponsReadResponseSchema>>>
   * @example
   * const result = await client.userCouponsRead({
   *   config: { timeout: 5000 }
   * })
   */
  userCouponsRead = cache(async (options: {
    params: z.infer<typeof UserCouponsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UserCouponsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UserCouponsReadResponseSchema>>(
      'GET',
      '/user-coupons/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UserCouponsReadResponseSchema
      }
    )
  })

  /**
   * PUT /user-coupons/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UserCouponsUpdateResponseSchema>>>
   * @example
   * const result = await client.userCouponsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  userCouponsUpdate = async (options: {
    params: z.infer<typeof UserCouponsUpdateParamsSchema>
    body: z.infer<typeof UserCouponsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await UserCouponsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await UserCouponsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UserCouponsUpdateResponseSchema>>(
      'PUT',
      '/user-coupons/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UserCouponsUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /user-coupons/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UserCouponsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.userCouponsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  userCouponsPartialUpdate = async (options: {
    params: z.infer<typeof UserCouponsPartialUpdateParamsSchema>
    body: z.infer<typeof UserCouponsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await UserCouponsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await UserCouponsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UserCouponsPartialUpdateResponseSchema>>(
      'PATCH',
      '/user-coupons/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UserCouponsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /user-coupons/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof UserCouponsDeleteResponseSchema>>>
   * @example
   * const result = await client.userCouponsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  userCouponsDelete = async (options: {
    params: z.infer<typeof UserCouponsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await UserCouponsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof UserCouponsDeleteResponseSchema>>(
      'DELETE',
      '/user-coupons/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: UserCouponsDeleteResponseSchema
      }
    )
  }
}