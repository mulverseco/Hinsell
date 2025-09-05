import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CouponsListResponseSchema,
  CouponsListParamsSchema,
  CouponsCreateRequestSchema,
  CouponsCreateResponseSchema,
  CouponsReadResponseSchema,
  CouponsReadParamsSchema,
  CouponsUpdateRequestSchema,
  CouponsUpdateResponseSchema,
  CouponsUpdateParamsSchema,
  CouponsPartialUpdateRequestSchema,
  CouponsPartialUpdateResponseSchema,
  CouponsPartialUpdateParamsSchema,
  CouponsDeleteResponseSchema,
  CouponsDeleteParamsSchema,
  CouponsApplyCouponRequestSchema,
  CouponsApplyCouponResponseSchema,
  CouponsApplyCouponParamsSchema
} from '@/core/generated/schemas'

export class CouponsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'coupons-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'coupons'
          }
        }
      }
    })
  }

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsListResponseSchema>>>
   * @example
   * const result = await client.couponsList({
   *   config: { timeout: 5000 }
   * })
   */
  couponsList = cache(async (options: {
    params: z.infer<typeof CouponsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CouponsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CouponsListResponseSchema>>(
      'GET',
      '/coupons/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsCreateResponseSchema>>>
   * @example
   * const result = await client.couponsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  couponsCreate = async (options: {
    body: z.infer<typeof CouponsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CouponsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof CouponsCreateResponseSchema>>(
      'POST',
      '/coupons/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsReadResponseSchema>>>
   * @example
   * const result = await client.couponsRead({
   *   config: { timeout: 5000 }
   * })
   */
  couponsRead = cache(async (options: {
    params: z.infer<typeof CouponsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CouponsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CouponsReadResponseSchema>>(
      'GET',
      '/coupons/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsUpdateResponseSchema>>>
   * @example
   * const result = await client.couponsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  couponsUpdate = async (options: {
    params: z.infer<typeof CouponsUpdateParamsSchema>
    body: z.infer<typeof CouponsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CouponsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CouponsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CouponsUpdateResponseSchema>>(
      'PUT',
      '/coupons/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.couponsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  couponsPartialUpdate = async (options: {
    params: z.infer<typeof CouponsPartialUpdateParamsSchema>
    body: z.infer<typeof CouponsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CouponsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CouponsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CouponsPartialUpdateResponseSchema>>(
      'PATCH',
      '/coupons/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsDeleteResponseSchema>>>
   * @example
   * const result = await client.couponsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  couponsDelete = async (options: {
    params: z.infer<typeof CouponsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CouponsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CouponsDeleteResponseSchema>>(
      'DELETE',
      '/coupons/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsDeleteResponseSchema
      }
    )
  }

  /**
   * ViewSet for Coupon model.
   * ViewSet for Coupon model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CouponsApplyCouponResponseSchema>>>
   * @example
   * const result = await client.couponsApplyCoupon({
   *   config: { timeout: 5000 }
   * })
   */
  couponsApplyCoupon = async (options: {
    params: z.infer<typeof CouponsApplyCouponParamsSchema>
    body: z.infer<typeof CouponsApplyCouponRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CouponsApplyCouponRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CouponsApplyCouponParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CouponsApplyCouponResponseSchema>>(
      'POST',
      '/coupons/{id}/apply/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CouponsApplyCouponResponseSchema
      }
    )
  }
}