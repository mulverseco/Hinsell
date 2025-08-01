import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  AccountTypesListResponseSchema,
  AccountTypesCreateRequestSchema,
  AccountTypesCreateResponseSchema,
  AccountTypesReadResponseSchema,
  AccountTypesReadParamsSchema,
  AccountTypesUpdateRequestSchema,
  AccountTypesUpdateResponseSchema,
  AccountTypesUpdateParamsSchema,
  AccountTypesPartialUpdateRequestSchema,
  AccountTypesPartialUpdateResponseSchema,
  AccountTypesPartialUpdateParamsSchema,
  AccountTypesDeleteResponseSchema,
  AccountTypesDeleteParamsSchema
} from '@/core/generated/schemas'

export class AccountTypesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'accountTypes-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'accountTypes'
          }
        }
      }
    })
  }

  /**
   * ViewSet for AccountType model.
   * ViewSet for AccountType model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountTypesListResponseSchema>>>
   * @example
   * const result = await client.accountTypesList({
   *   config: { timeout: 5000 }
   * })
   */
  accountTypesList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof AccountTypesListResponseSchema>>(
      'GET',
      '/account-types/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountTypesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for AccountType model.
   * ViewSet for AccountType model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountTypesCreateResponseSchema>>>
   * @example
   * const result = await client.accountTypesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  accountTypesCreate = async (options: {
    body: z.infer<typeof AccountTypesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountTypesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AccountTypesCreateResponseSchema>>(
      'POST',
      '/account-types/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountTypesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for AccountType model.
   * ViewSet for AccountType model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountTypesReadResponseSchema>>>
   * @example
   * const result = await client.accountTypesRead({
   *   config: { timeout: 5000 }
   * })
   */
  accountTypesRead = cache(async (options: {
    params: z.infer<typeof AccountTypesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AccountTypesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountTypesReadResponseSchema>>(
      'GET',
      '/account-types/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountTypesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for AccountType model.
   * ViewSet for AccountType model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountTypesUpdateResponseSchema>>>
   * @example
   * const result = await client.accountTypesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  accountTypesUpdate = async (options: {
    params: z.infer<typeof AccountTypesUpdateParamsSchema>
    body: z.infer<typeof AccountTypesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountTypesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountTypesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountTypesUpdateResponseSchema>>(
      'PUT',
      '/account-types/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountTypesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for AccountType model.
   * ViewSet for AccountType model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountTypesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.accountTypesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  accountTypesPartialUpdate = async (options: {
    params: z.infer<typeof AccountTypesPartialUpdateParamsSchema>
    body: z.infer<typeof AccountTypesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AccountTypesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AccountTypesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountTypesPartialUpdateResponseSchema>>(
      'PATCH',
      '/account-types/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountTypesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for AccountType model.
   * ViewSet for AccountType model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AccountTypesDeleteResponseSchema>>>
   * @example
   * const result = await client.accountTypesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  accountTypesDelete = async (options: {
    params: z.infer<typeof AccountTypesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AccountTypesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AccountTypesDeleteResponseSchema>>(
      'DELETE',
      '/account-types/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AccountTypesDeleteResponseSchema
      }
    )
  }
}