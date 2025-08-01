import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  AccountsListResponseSchema,
  AccountsCreateRequestSchema,
  AccountsCreateResponseSchema,
  AccountsReadResponseSchema,
  AccountsReadParamsSchema,
  AccountsUpdateRequestSchema,
  AccountsUpdateResponseSchema,
  AccountsUpdateParamsSchema,
  AccountsPartialUpdateRequestSchema,
  AccountsPartialUpdateResponseSchema,
  AccountsPartialUpdateParamsSchema,
  AccountsDeleteResponseSchema,
  AccountsDeleteParamsSchema,
  AccountsUpdateBalanceRequestSchema,
  AccountsUpdateBalanceResponseSchema,
  AccountsUpdateBalanceParamsSchema
} from '@/core/generated/schemas'

export class AccountsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'accounts-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'accounts'
          }
        }
      }
    })
  }

  /**
   * ViewSet for Account model.
   * ViewSet for Account model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsListResponseSchema>>>
   * @example
   * const result = await client.accountsList({
   *   config: { timeout: 5000 }
   * })
   */
  accountsList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AccountsListResponseSchema>>(
      'GET',
      '/accounts/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for Account model.
   * ViewSet for Account model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsCreateResponseSchema>>>
   * @example
   * const result = await client.accountsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  accountsCreate = async (options: {
    body: z.infer<typeof AccountsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AccountsCreateResponseSchema>>(
      'POST',
      '/accounts/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Account model.
   * ViewSet for Account model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsReadResponseSchema>>>
   * @example
   * const result = await client.accountsRead({
   *   config: { timeout: 5000 }
   * })
   */
  accountsRead = cache(async (options: {
    params: z.infer<typeof AccountsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AccountsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountsReadResponseSchema>>(
      'GET',
      '/accounts/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for Account model.
   * ViewSet for Account model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsUpdateResponseSchema>>>
   * @example
   * const result = await client.accountsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  accountsUpdate = async (options: {
    params: z.infer<typeof AccountsUpdateParamsSchema>
    body: z.infer<typeof AccountsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountsUpdateResponseSchema>>(
      'PUT',
      '/accounts/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Account model.
   * ViewSet for Account model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.accountsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  accountsPartialUpdate = async (options: {
    params: z.infer<typeof AccountsPartialUpdateParamsSchema>
    body: z.infer<typeof AccountsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountsPartialUpdateResponseSchema>>(
      'PATCH',
      '/accounts/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for Account model.
   * ViewSet for Account model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsDeleteResponseSchema>>>
   * @example
   * const result = await client.accountsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  accountsDelete = async (options: {
    params: z.infer<typeof AccountsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AccountsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountsDeleteResponseSchema>>(
      'DELETE',
      '/accounts/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsDeleteResponseSchema
      }
    )
  }

  /**
   * Update account balance.
   * Update account balance.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsUpdateBalanceResponseSchema>>>
   * @example
   * const result = await client.accountsUpdateBalance({
   *   config: { timeout: 5000 }
   * })
   */
  accountsUpdateBalance = async (options: {
    params: z.infer<typeof AccountsUpdateBalanceParamsSchema>
    body: z.infer<typeof AccountsUpdateBalanceRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountsUpdateBalanceRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountsUpdateBalanceParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountsUpdateBalanceResponseSchema>>(
      'POST',
      '/accounts/{id}/update-balance/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsUpdateBalanceResponseSchema
      }
    )
  }

  /**
   * Update account balance.
   * Update account balance.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountsUpdateBalanceResponseSchema>>>
   * @example
   * const result = await client.accountsUpdateBalance({
   *   config: { timeout: 5000 }
   * })
   */
  accountsUpdateBalance = async (options: {
    params: z.infer<typeof AccountsUpdateBalanceParamsSchema>
    body: z.infer<typeof AccountsUpdateBalanceRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountsUpdateBalanceRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountsUpdateBalanceParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountsUpdateBalanceResponseSchema>>(
      'POST',
      '/accounts/{id}/update_balance/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountsUpdateBalanceResponseSchema
      }
    )
  }
}