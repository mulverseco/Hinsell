import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  SubscribersListResponseSchema,
  SubscribersListParamsSchema,
  SubscribersCreateRequestSchema,
  SubscribersCreateResponseSchema,
  SubscribersReadResponseSchema,
  SubscribersReadParamsSchema,
  SubscribersUpdateRequestSchema,
  SubscribersUpdateResponseSchema,
  SubscribersUpdateParamsSchema,
  SubscribersPartialUpdateRequestSchema,
  SubscribersPartialUpdateResponseSchema,
  SubscribersPartialUpdateParamsSchema,
  SubscribersDeleteResponseSchema,
  SubscribersDeleteParamsSchema
} from '@/core/generated/schemas'

export class SubscribersApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'subscribers-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'subscribers'
          }
        }
      }
    })
  }

  /**
   * ViewSet for InsuranceSubscriber model.
   * ViewSet for InsuranceSubscriber model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SubscribersListResponseSchema>>>
   * @example
   * const result = await client.subscribersList({
   *   config: { timeout: 5000 }
   * })
   */
  subscribersList = cache(async (options: {
    params: z.infer<typeof SubscribersListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await SubscribersListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SubscribersListResponseSchema>>(
      'GET',
      '/subscribers/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SubscribersListResponseSchema
      }
    )
  })

  /**
   * ViewSet for InsuranceSubscriber model.
   * ViewSet for InsuranceSubscriber model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SubscribersCreateResponseSchema>>>
   * @example
   * const result = await client.subscribersCreate({
   *   config: { timeout: 5000 }
   * })
   */
  subscribersCreate = async (options: {
    body: z.infer<typeof SubscribersCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await SubscribersCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof SubscribersCreateResponseSchema>>(
      'POST',
      '/subscribers/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SubscribersCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for InsuranceSubscriber model.
   * ViewSet for InsuranceSubscriber model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SubscribersReadResponseSchema>>>
   * @example
   * const result = await client.subscribersRead({
   *   config: { timeout: 5000 }
   * })
   */
  subscribersRead = cache(async (options: {
    params: z.infer<typeof SubscribersReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await SubscribersReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SubscribersReadResponseSchema>>(
      'GET',
      '/subscribers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SubscribersReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for InsuranceSubscriber model.
   * ViewSet for InsuranceSubscriber model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SubscribersUpdateResponseSchema>>>
   * @example
   * const result = await client.subscribersUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  subscribersUpdate = async (options: {
    params: z.infer<typeof SubscribersUpdateParamsSchema>
    body: z.infer<typeof SubscribersUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await SubscribersUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await SubscribersUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SubscribersUpdateResponseSchema>>(
      'PUT',
      '/subscribers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SubscribersUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for InsuranceSubscriber model.
   * ViewSet for InsuranceSubscriber model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SubscribersPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.subscribersPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  subscribersPartialUpdate = async (options: {
    params: z.infer<typeof SubscribersPartialUpdateParamsSchema>
    body: z.infer<typeof SubscribersPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await SubscribersPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await SubscribersPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SubscribersPartialUpdateResponseSchema>>(
      'PATCH',
      '/subscribers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SubscribersPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for InsuranceSubscriber model.
   * ViewSet for InsuranceSubscriber model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SubscribersDeleteResponseSchema>>>
   * @example
   * const result = await client.subscribersDelete({
   *   config: { timeout: 5000 }
   * })
   */
  subscribersDelete = async (options: {
    params: z.infer<typeof SubscribersDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await SubscribersDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SubscribersDeleteResponseSchema>>(
      'DELETE',
      '/subscribers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SubscribersDeleteResponseSchema
      }
    )
  }
}