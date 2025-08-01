import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  BranchesListResponseSchema,
  BranchesListParamsSchema,
  BranchesCreateRequestSchema,
  BranchesCreateResponseSchema,
  BranchesReadResponseSchema,
  BranchesReadParamsSchema,
  BranchesUpdateRequestSchema,
  BranchesUpdateResponseSchema,
  BranchesUpdateParamsSchema,
  BranchesPartialUpdateRequestSchema,
  BranchesPartialUpdateResponseSchema,
  BranchesPartialUpdateParamsSchema,
  BranchesDeleteResponseSchema,
  BranchesDeleteParamsSchema
} from '@/core/generated/schemas'

export class BranchesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'branches-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'branches'
          }
        }
      }
    })
  }

  /**
   * GET /branches/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BranchesListResponseSchema>>>
   * @example
   * const result = await client.branchesList({
   *   config: { timeout: 5000 }
   * })
   */
  branchesList = cache(async (options: {
    params: z.infer<typeof BranchesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await BranchesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BranchesListResponseSchema>>(
      'GET',
      '/branches/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BranchesListResponseSchema
      }
    )
  })

  /**
   * POST /branches/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BranchesCreateResponseSchema>>>
   * @example
   * const result = await client.branchesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  branchesCreate = async (options: {
    body: z.infer<typeof BranchesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await BranchesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof BranchesCreateResponseSchema>>(
      'POST',
      '/branches/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BranchesCreateResponseSchema
      }
    )
  }

  /**
   * GET /branches/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BranchesReadResponseSchema>>>
   * @example
   * const result = await client.branchesRead({
   *   config: { timeout: 5000 }
   * })
   */
  branchesRead = cache(async (options: {
    params: z.infer<typeof BranchesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await BranchesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BranchesReadResponseSchema>>(
      'GET',
      '/branches/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BranchesReadResponseSchema
      }
    )
  })

  /**
   * PUT /branches/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BranchesUpdateResponseSchema>>>
   * @example
   * const result = await client.branchesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  branchesUpdate = async (options: {
    params: z.infer<typeof BranchesUpdateParamsSchema>
    body: z.infer<typeof BranchesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await BranchesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await BranchesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BranchesUpdateResponseSchema>>(
      'PUT',
      '/branches/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BranchesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /branches/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BranchesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.branchesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  branchesPartialUpdate = async (options: {
    params: z.infer<typeof BranchesPartialUpdateParamsSchema>
    body: z.infer<typeof BranchesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await BranchesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await BranchesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BranchesPartialUpdateResponseSchema>>(
      'PATCH',
      '/branches/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BranchesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /branches/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof BranchesDeleteResponseSchema>>>
   * @example
   * const result = await client.branchesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  branchesDelete = async (options: {
    params: z.infer<typeof BranchesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await BranchesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof BranchesDeleteResponseSchema>>(
      'DELETE',
      '/branches/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: BranchesDeleteResponseSchema
      }
    )
  }
}