import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  TransactionTypesListResponseSchema,
  TransactionTypesListParamsSchema,
  TransactionTypesCreateRequestSchema,
  TransactionTypesCreateResponseSchema,
  TransactionTypesReadResponseSchema,
  TransactionTypesReadParamsSchema,
  TransactionTypesUpdateRequestSchema,
  TransactionTypesUpdateResponseSchema,
  TransactionTypesUpdateParamsSchema,
  TransactionTypesPartialUpdateRequestSchema,
  TransactionTypesPartialUpdateResponseSchema,
  TransactionTypesPartialUpdateParamsSchema,
  TransactionTypesDeleteResponseSchema,
  TransactionTypesDeleteParamsSchema
} from '@/core/generated/schemas'

export class TransactionTypesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'transactionTypes-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'transactionTypes'
          }
        }
      }
    })
  }

  /**
   * GET /transaction-types/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionTypesListResponseSchema>>>
   * @example
   * const result = await client.transactionTypesList({
   *   config: { timeout: 5000 }
   * })
   */
  transactionTypesList = cache(async (options: {
    params: z.infer<typeof TransactionTypesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionTypesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionTypesListResponseSchema>>(
      'GET',
      '/transaction-types/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionTypesListResponseSchema
      }
    )
  })

  /**
   * POST /transaction-types/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionTypesCreateResponseSchema>>>
   * @example
   * const result = await client.transactionTypesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionTypesCreate = async (options: {
    body: z.infer<typeof TransactionTypesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionTypesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof TransactionTypesCreateResponseSchema>>(
      'POST',
      '/transaction-types/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionTypesCreateResponseSchema
      }
    )
  }

  /**
   * GET /transaction-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionTypesReadResponseSchema>>>
   * @example
   * const result = await client.transactionTypesRead({
   *   config: { timeout: 5000 }
   * })
   */
  transactionTypesRead = cache(async (options: {
    params: z.infer<typeof TransactionTypesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionTypesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionTypesReadResponseSchema>>(
      'GET',
      '/transaction-types/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionTypesReadResponseSchema
      }
    )
  })

  /**
   * PUT /transaction-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionTypesUpdateResponseSchema>>>
   * @example
   * const result = await client.transactionTypesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionTypesUpdate = async (options: {
    params: z.infer<typeof TransactionTypesUpdateParamsSchema>
    body: z.infer<typeof TransactionTypesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionTypesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionTypesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionTypesUpdateResponseSchema>>(
      'PUT',
      '/transaction-types/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionTypesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /transaction-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionTypesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.transactionTypesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  transactionTypesPartialUpdate = async (options: {
    params: z.infer<typeof TransactionTypesPartialUpdateParamsSchema>
    body: z.infer<typeof TransactionTypesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TransactionTypesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TransactionTypesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionTypesPartialUpdateResponseSchema>>(
      'PATCH',
      '/transaction-types/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionTypesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /transaction-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TransactionTypesDeleteResponseSchema>>>
   * @example
   * const result = await client.transactionTypesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  transactionTypesDelete = async (options: {
    params: z.infer<typeof TransactionTypesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TransactionTypesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TransactionTypesDeleteResponseSchema>>(
      'DELETE',
      '/transaction-types/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TransactionTypesDeleteResponseSchema
      }
    )
  }
}