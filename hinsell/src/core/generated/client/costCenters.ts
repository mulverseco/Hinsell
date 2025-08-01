import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CostCentersListResponseSchema,
  CostCentersCreateRequestSchema,
  CostCentersCreateResponseSchema,
  CostCentersReadResponseSchema,
  CostCentersReadParamsSchema,
  CostCentersUpdateRequestSchema,
  CostCentersUpdateResponseSchema,
  CostCentersUpdateParamsSchema,
  CostCentersPartialUpdateRequestSchema,
  CostCentersPartialUpdateResponseSchema,
  CostCentersPartialUpdateParamsSchema,
  CostCentersDeleteResponseSchema,
  CostCentersDeleteParamsSchema
} from '@/core/generated/schemas'

export class CostCentersApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'costCenters-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'costCenters'
          }
        }
      }
    })
  }

  /**
   * ViewSet for CostCenter model.
   * ViewSet for CostCenter model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CostCentersListResponseSchema>>>
   * @example
   * const result = await client.costCentersList({
   *   config: { timeout: 5000 }
   * })
   */
  costCentersList = cache(async (options?: { config?: RequestConfiguration }) => {
    return this.request<z.infer<typeof CostCentersListResponseSchema>>(
      'GET',
      '/cost-centers/',
      {
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CostCentersListResponseSchema
      }
    )
  })

  /**
   * ViewSet for CostCenter model.
   * ViewSet for CostCenter model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CostCentersCreateResponseSchema>>>
   * @example
   * const result = await client.costCentersCreate({
   *   config: { timeout: 5000 }
   * })
   */
  costCentersCreate = async (options: {
    body: z.infer<typeof CostCentersCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CostCentersCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof CostCentersCreateResponseSchema>>(
      'POST',
      '/cost-centers/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CostCentersCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for CostCenter model.
   * ViewSet for CostCenter model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CostCentersReadResponseSchema>>>
   * @example
   * const result = await client.costCentersRead({
   *   config: { timeout: 5000 }
   * })
   */
  costCentersRead = cache(async (options: {
    params: z.infer<typeof CostCentersReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CostCentersReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CostCentersReadResponseSchema>>(
      'GET',
      '/cost-centers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CostCentersReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for CostCenter model.
   * ViewSet for CostCenter model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CostCentersUpdateResponseSchema>>>
   * @example
   * const result = await client.costCentersUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  costCentersUpdate = async (options: {
    params: z.infer<typeof CostCentersUpdateParamsSchema>
    body: z.infer<typeof CostCentersUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CostCentersUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CostCentersUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CostCentersUpdateResponseSchema>>(
      'PUT',
      '/cost-centers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CostCentersUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for CostCenter model.
   * ViewSet for CostCenter model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CostCentersPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.costCentersPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  costCentersPartialUpdate = async (options: {
    params: z.infer<typeof CostCentersPartialUpdateParamsSchema>
    body: z.infer<typeof CostCentersPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CostCentersPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CostCentersPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CostCentersPartialUpdateResponseSchema>>(
      'PATCH',
      '/cost-centers/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CostCentersPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for CostCenter model.
   * ViewSet for CostCenter model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CostCentersDeleteResponseSchema>>>
   * @example
   * const result = await client.costCentersDelete({
   *   config: { timeout: 5000 }
   * })
   */
  costCentersDelete = async (options: {
    params: z.infer<typeof CostCentersDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CostCentersDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CostCentersDeleteResponseSchema>>(
      'DELETE',
      '/cost-centers/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CostCentersDeleteResponseSchema
      }
    )
  }
}