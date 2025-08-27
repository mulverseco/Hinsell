import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  AccountingPeriodsListResponseSchema,
  AccountingPeriodsCreateRequestSchema,
  AccountingPeriodsCreateResponseSchema,
  AccountingPeriodsReadResponseSchema,
  AccountingPeriodsReadParamsSchema,
  AccountingPeriodsUpdateRequestSchema,
  AccountingPeriodsUpdateResponseSchema,
  AccountingPeriodsUpdateParamsSchema,
  AccountingPeriodsPartialUpdateRequestSchema,
  AccountingPeriodsPartialUpdateResponseSchema,
  AccountingPeriodsPartialUpdateParamsSchema,
  AccountingPeriodsDeleteResponseSchema,
  AccountingPeriodsDeleteParamsSchema
} from '@/core/generated/schemas'

export class AccountingPeriodsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'accountingPeriods-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'accountingPeriods'
          }
        }
      }
    })
  }

  /**
   * ViewSet for AccountingPeriod model.
   * ViewSet for AccountingPeriod model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountingPeriodsListResponseSchema>>>
   * @example
   * const result = await client.accountingPeriodsList({
   *   config: { timeout: 5000 }
   * })
   */
  accountingPeriodsList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AccountingPeriodsListResponseSchema>>(
      'GET',
      '/accounting-periods/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountingPeriodsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for AccountingPeriod model.
   * ViewSet for AccountingPeriod model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountingPeriodsCreateResponseSchema>>>
   * @example
   * const result = await client.accountingPeriodsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  accountingPeriodsCreate = async (options: {
    body: z.infer<typeof AccountingPeriodsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountingPeriodsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AccountingPeriodsCreateResponseSchema>>(
      'POST',
      '/accounting-periods/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountingPeriodsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for AccountingPeriod model.
   * ViewSet for AccountingPeriod model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountingPeriodsReadResponseSchema>>>
   * @example
   * const result = await client.accountingPeriodsRead({
   *   config: { timeout: 5000 }
   * })
   */
  accountingPeriodsRead = cache(async (options: {
    params: z.infer<typeof AccountingPeriodsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AccountingPeriodsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountingPeriodsReadResponseSchema>>(
      'GET',
      '/accounting-periods/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountingPeriodsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for AccountingPeriod model.
   * ViewSet for AccountingPeriod model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountingPeriodsUpdateResponseSchema>>>
   * @example
   * const result = await client.accountingPeriodsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  accountingPeriodsUpdate = async (options: {
    params: z.infer<typeof AccountingPeriodsUpdateParamsSchema>
    body: z.infer<typeof AccountingPeriodsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountingPeriodsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountingPeriodsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountingPeriodsUpdateResponseSchema>>(
      'PUT',
      '/accounting-periods/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountingPeriodsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for AccountingPeriod model.
   * ViewSet for AccountingPeriod model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountingPeriodsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.accountingPeriodsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  accountingPeriodsPartialUpdate = async (options: {
    params: z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema>
    body: z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountingPeriodsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountingPeriodsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountingPeriodsPartialUpdateResponseSchema>>(
      'PATCH',
      '/accounting-periods/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountingPeriodsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for AccountingPeriod model.
   * ViewSet for AccountingPeriod model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountingPeriodsDeleteResponseSchema>>>
   * @example
   * const result = await client.accountingPeriodsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  accountingPeriodsDelete = async (options: {
    params: z.infer<typeof AccountingPeriodsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AccountingPeriodsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountingPeriodsDeleteResponseSchema>>(
      'DELETE',
      '/accounting-periods/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountingPeriodsDeleteResponseSchema
      }
    )
  }
}