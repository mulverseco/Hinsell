import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  LedgerEntriesListResponseSchema,
  LedgerEntriesListParamsSchema,
  LedgerEntriesCreateRequestSchema,
  LedgerEntriesCreateResponseSchema,
  LedgerEntriesReadResponseSchema,
  LedgerEntriesReadParamsSchema,
  LedgerEntriesUpdateRequestSchema,
  LedgerEntriesUpdateResponseSchema,
  LedgerEntriesUpdateParamsSchema,
  LedgerEntriesPartialUpdateRequestSchema,
  LedgerEntriesPartialUpdateResponseSchema,
  LedgerEntriesPartialUpdateParamsSchema,
  LedgerEntriesDeleteResponseSchema,
  LedgerEntriesDeleteParamsSchema
} from '@/core/generated/schemas'

export class LedgerEntriesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'ledgerEntries-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'ledgerEntries'
          }
        }
      }
    })
  }

  /**
   * GET /ledger-entries/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LedgerEntriesListResponseSchema>>>
   * @example
   * const result = await client.ledgerEntriesList({
   *   config: { timeout: 5000 }
   * })
   */
  ledgerEntriesList = cache(async (options: {
    params: z.infer<typeof LedgerEntriesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LedgerEntriesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LedgerEntriesListResponseSchema>>(
      'GET',
      '/ledger-entries/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LedgerEntriesListResponseSchema
      }
    )
  })

  /**
   * POST /ledger-entries/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LedgerEntriesCreateResponseSchema>>>
   * @example
   * const result = await client.ledgerEntriesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  ledgerEntriesCreate = async (options: {
    body: z.infer<typeof LedgerEntriesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LedgerEntriesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof LedgerEntriesCreateResponseSchema>>(
      'POST',
      '/ledger-entries/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LedgerEntriesCreateResponseSchema
      }
    )
  }

  /**
   * GET /ledger-entries/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LedgerEntriesReadResponseSchema>>>
   * @example
   * const result = await client.ledgerEntriesRead({
   *   config: { timeout: 5000 }
   * })
   */
  ledgerEntriesRead = cache(async (options: {
    params: z.infer<typeof LedgerEntriesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LedgerEntriesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LedgerEntriesReadResponseSchema>>(
      'GET',
      '/ledger-entries/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LedgerEntriesReadResponseSchema
      }
    )
  })

  /**
   * PUT /ledger-entries/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LedgerEntriesUpdateResponseSchema>>>
   * @example
   * const result = await client.ledgerEntriesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  ledgerEntriesUpdate = async (options: {
    params: z.infer<typeof LedgerEntriesUpdateParamsSchema>
    body: z.infer<typeof LedgerEntriesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LedgerEntriesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LedgerEntriesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LedgerEntriesUpdateResponseSchema>>(
      'PUT',
      '/ledger-entries/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LedgerEntriesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /ledger-entries/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LedgerEntriesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.ledgerEntriesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  ledgerEntriesPartialUpdate = async (options: {
    params: z.infer<typeof LedgerEntriesPartialUpdateParamsSchema>
    body: z.infer<typeof LedgerEntriesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LedgerEntriesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LedgerEntriesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LedgerEntriesPartialUpdateResponseSchema>>(
      'PATCH',
      '/ledger-entries/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LedgerEntriesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /ledger-entries/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LedgerEntriesDeleteResponseSchema>>>
   * @example
   * const result = await client.ledgerEntriesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  ledgerEntriesDelete = async (options: {
    params: z.infer<typeof LedgerEntriesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LedgerEntriesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LedgerEntriesDeleteResponseSchema>>(
      'DELETE',
      '/ledger-entries/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LedgerEntriesDeleteResponseSchema
      }
    )
  }
}