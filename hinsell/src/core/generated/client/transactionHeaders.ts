import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  TransactionHeadersListResponseSchema,
  TransactionHeadersListParamsSchema,
  TransactionHeadersCreateRequestSchema,
  TransactionHeadersCreateResponseSchema,
  TransactionHeadersReadResponseSchema,
  TransactionHeadersReadParamsSchema,
  TransactionHeadersUpdateRequestSchema,
  TransactionHeadersUpdateResponseSchema,
  TransactionHeadersUpdateParamsSchema,
  TransactionHeadersPartialUpdateRequestSchema,
  TransactionHeadersPartialUpdateResponseSchema,
  TransactionHeadersPartialUpdateParamsSchema,
  TransactionHeadersDeleteResponseSchema,
  TransactionHeadersDeleteParamsSchema,
  TransactionHeadersApproveRequestSchema,
  TransactionHeadersApproveResponseSchema,
  TransactionHeadersApproveParamsSchema,
  TransactionHeadersPostRequestSchema,
  TransactionHeadersPostResponseSchema,
  TransactionHeadersPostParamsSchema,
  TransactionHeadersReverseRequestSchema,
  TransactionHeadersReverseResponseSchema,
  TransactionHeadersReverseParamsSchema
} from '@/core/generated/schemas'

export class TransactionHeadersApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'transactionHeaders-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'transactionHeaders'
          }
        }
      }
    })
  }

  /**
   * GET /transaction-headers/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersListResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersList({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersList = cache(async (options: {
    params: z.infer<typeof TransactionHeadersListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionHeadersListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersListResponseSchema>>(
      'GET',
      '/transaction-headers/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersListResponseSchema
      }
    )
  })

  /**
   * POST /transaction-headers/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersCreateResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersCreate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersCreate = async (options: {
    body: z.infer<typeof TransactionHeadersCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionHeadersCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof TransactionHeadersCreateResponseSchema>>(
      'POST',
      '/transaction-headers/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersCreateResponseSchema
      }
    )
  }

  /**
   * GET /transaction-headers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersReadResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersRead({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersRead = cache(async (options: {
    params: z.infer<typeof TransactionHeadersReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionHeadersReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersReadResponseSchema>>(
      'GET',
      '/transaction-headers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersReadResponseSchema
      }
    )
  })

  /**
   * PUT /transaction-headers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersUpdateResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersUpdate = async (options: {
    params: z.infer<typeof TransactionHeadersUpdateParamsSchema>
    body: z.infer<typeof TransactionHeadersUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionHeadersUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionHeadersUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersUpdateResponseSchema>>(
      'PUT',
      '/transaction-headers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /transaction-headers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersPartialUpdate = async (options: {
    params: z.infer<typeof TransactionHeadersPartialUpdateParamsSchema>
    body: z.infer<typeof TransactionHeadersPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionHeadersPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionHeadersPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersPartialUpdateResponseSchema>>(
      'PATCH',
      '/transaction-headers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /transaction-headers/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersDeleteResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersDelete({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersDelete = async (options: {
    params: z.infer<typeof TransactionHeadersDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionHeadersDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersDeleteResponseSchema>>(
      'DELETE',
      '/transaction-headers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersDeleteResponseSchema
      }
    )
  }

  /**
   * POST /transaction-headers/{id}/approve/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersApproveResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersApprove({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersApprove = async (options: {
    params: z.infer<typeof TransactionHeadersApproveParamsSchema>
    body: z.infer<typeof TransactionHeadersApproveRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionHeadersApproveRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionHeadersApproveParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersApproveResponseSchema>>(
      'POST',
      '/transaction-headers/{id}/approve/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersApproveResponseSchema
      }
    )
  }

  /**
   * POST /transaction-headers/{id}/post/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersPostResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersPost({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersPost = async (options: {
    params: z.infer<typeof TransactionHeadersPostParamsSchema>
    body: z.infer<typeof TransactionHeadersPostRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionHeadersPostRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionHeadersPostParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersPostResponseSchema>>(
      'POST',
      '/transaction-headers/{id}/post/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersPostResponseSchema
      }
    )
  }

  /**
   * POST /transaction-headers/{id}/reverse/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionHeadersReverseResponseSchema>>>
   * @example
   * const result = await client.transactionHeadersReverse({
   *   config: { timeout: 5000 }
   * })
   */
  transactionHeadersReverse = async (options: {
    params: z.infer<typeof TransactionHeadersReverseParamsSchema>
    body: z.infer<typeof TransactionHeadersReverseRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionHeadersReverseRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionHeadersReverseParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionHeadersReverseResponseSchema>>(
      'POST',
      '/transaction-headers/{id}/reverse/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionHeadersReverseResponseSchema
      }
    )
  }
}