import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  TransactionDetailsListResponseSchema,
  TransactionDetailsListParamsSchema,
  TransactionDetailsCreateRequestSchema,
  TransactionDetailsCreateResponseSchema,
  TransactionDetailsReadResponseSchema,
  TransactionDetailsReadParamsSchema,
  TransactionDetailsUpdateRequestSchema,
  TransactionDetailsUpdateResponseSchema,
  TransactionDetailsUpdateParamsSchema,
  TransactionDetailsPartialUpdateRequestSchema,
  TransactionDetailsPartialUpdateResponseSchema,
  TransactionDetailsPartialUpdateParamsSchema,
  TransactionDetailsDeleteResponseSchema,
  TransactionDetailsDeleteParamsSchema
} from '@/core/generated/schemas'

export class TransactionDetailsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'transactionDetails-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'transactionDetails'
          }
        }
      }
    })
  }

  /**
   * GET /transaction-details/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionDetailsListResponseSchema>>>
   * @example
   * const result = await client.transactionDetailsList({
   *   config: { timeout: 5000 }
   * })
   */
  transactionDetailsList = cache(async (options: {
    params: z.infer<typeof TransactionDetailsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionDetailsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionDetailsListResponseSchema>>(
      'GET',
      '/transaction-details/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionDetailsListResponseSchema
      }
    )
  })

  /**
   * POST /transaction-details/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionDetailsCreateResponseSchema>>>
   * @example
   * const result = await client.transactionDetailsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionDetailsCreate = async (options: {
    body: z.infer<typeof TransactionDetailsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionDetailsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof TransactionDetailsCreateResponseSchema>>(
      'POST',
      '/transaction-details/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionDetailsCreateResponseSchema
      }
    )
  }

  /**
   * GET /transaction-details/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionDetailsReadResponseSchema>>>
   * @example
   * const result = await client.transactionDetailsRead({
   *   config: { timeout: 5000 }
   * })
   */
  transactionDetailsRead = cache(async (options: {
    params: z.infer<typeof TransactionDetailsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionDetailsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionDetailsReadResponseSchema>>(
      'GET',
      '/transaction-details/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionDetailsReadResponseSchema
      }
    )
  })

  /**
   * PUT /transaction-details/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionDetailsUpdateResponseSchema>>>
   * @example
   * const result = await client.transactionDetailsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionDetailsUpdate = async (options: {
    params: z.infer<typeof TransactionDetailsUpdateParamsSchema>
    body: z.infer<typeof TransactionDetailsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionDetailsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionDetailsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionDetailsUpdateResponseSchema>>(
      'PUT',
      '/transaction-details/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionDetailsUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /transaction-details/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionDetailsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.transactionDetailsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionDetailsPartialUpdate = async (options: {
    params: z.infer<typeof TransactionDetailsPartialUpdateParamsSchema>
    body: z.infer<typeof TransactionDetailsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionDetailsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionDetailsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionDetailsPartialUpdateResponseSchema>>(
      'PATCH',
      '/transaction-details/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionDetailsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /transaction-details/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionDetailsDeleteResponseSchema>>>
   * @example
   * const result = await client.transactionDetailsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  transactionDetailsDelete = async (options: {
    params: z.infer<typeof TransactionDetailsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionDetailsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionDetailsDeleteResponseSchema>>(
      'DELETE',
      '/transaction-details/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionDetailsDeleteResponseSchema
      }
    )
  }
}