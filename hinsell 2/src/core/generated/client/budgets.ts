import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  BudgetsListResponseSchema,
  BudgetsCreateRequestSchema,
  BudgetsCreateResponseSchema,
  BudgetsReadResponseSchema,
  BudgetsReadParamsSchema,
  BudgetsUpdateRequestSchema,
  BudgetsUpdateResponseSchema,
  BudgetsUpdateParamsSchema,
  BudgetsPartialUpdateRequestSchema,
  BudgetsPartialUpdateResponseSchema,
  BudgetsPartialUpdateParamsSchema,
  BudgetsDeleteResponseSchema,
  BudgetsDeleteParamsSchema
} from '@/core/generated/schemas'

export class BudgetsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'budgets-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'budgets'
          }
        }
      }
    })
  }

  /**
   * ViewSet for Budget model.
   * ViewSet for Budget model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BudgetsListResponseSchema>>>
   * @example
   * const result = await client.budgetsList({
   *   config: { timeout: 5000 }
   * })
   */
  budgetsList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof BudgetsListResponseSchema>>(
      'GET',
      '/budgets/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BudgetsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for Budget model.
   * ViewSet for Budget model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BudgetsCreateResponseSchema>>>
   * @example
   * const result = await client.budgetsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  budgetsCreate = async (options: {
    body: z.infer<typeof BudgetsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await BudgetsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof BudgetsCreateResponseSchema>>(
      'POST',
      '/budgets/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BudgetsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Budget model.
   * ViewSet for Budget model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BudgetsReadResponseSchema>>>
   * @example
   * const result = await client.budgetsRead({
   *   config: { timeout: 5000 }
   * })
   */
  budgetsRead = cache(async (options: {
    params: z.infer<typeof BudgetsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await BudgetsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BudgetsReadResponseSchema>>(
      'GET',
      '/budgets/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BudgetsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for Budget model.
   * ViewSet for Budget model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BudgetsUpdateResponseSchema>>>
   * @example
   * const result = await client.budgetsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  budgetsUpdate = async (options: {
    params: z.infer<typeof BudgetsUpdateParamsSchema>
    body: z.infer<typeof BudgetsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await BudgetsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await BudgetsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BudgetsUpdateResponseSchema>>(
      'PUT',
      '/budgets/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BudgetsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Budget model.
   * ViewSet for Budget model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BudgetsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.budgetsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  budgetsPartialUpdate = async (options: {
    params: z.infer<typeof BudgetsPartialUpdateParamsSchema>
    body: z.infer<typeof BudgetsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await BudgetsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await BudgetsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BudgetsPartialUpdateResponseSchema>>(
      'PATCH',
      '/budgets/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BudgetsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Budget model.
   * ViewSet for Budget model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BudgetsDeleteResponseSchema>>>
   * @example
   * const result = await client.budgetsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  budgetsDelete = async (options: {
    params: z.infer<typeof BudgetsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await BudgetsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BudgetsDeleteResponseSchema>>(
      'DELETE',
      '/budgets/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BudgetsDeleteResponseSchema
      }
    )
  }
}