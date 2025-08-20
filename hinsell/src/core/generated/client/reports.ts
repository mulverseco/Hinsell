import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ReportsListResponseSchema,
  ReportsListParamsSchema,
  ReportsCreateRequestSchema,
  ReportsCreateResponseSchema,
  ReportsAvailableModelsResponseSchema,
  ReportsAvailableModelsParamsSchema,
  ReportsValidateQueryRequestSchema,
  ReportsValidateQueryResponseSchema,
  ReportsReadResponseSchema,
  ReportsReadParamsSchema,
  ReportsUpdateRequestSchema,
  ReportsUpdateResponseSchema,
  ReportsUpdateParamsSchema,
  ReportsPartialUpdateRequestSchema,
  ReportsPartialUpdateResponseSchema,
  ReportsPartialUpdateParamsSchema,
  ReportsDeleteResponseSchema,
  ReportsDeleteParamsSchema,
  ReportsExecuteRequestSchema,
  ReportsExecuteResponseSchema,
  ReportsExecuteParamsSchema,
  ReportsPreviewResponseSchema,
  ReportsPreviewParamsSchema
} from '@/core/generated/schemas'

export class ReportsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'reports-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'reports'
          }
        }
      }
    })
  }

  /**
   * GET /reports/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsListResponseSchema>>>
   * @example
   * const result = await client.reportsList({
   *   config: { timeout: 5000 }
   * })
   */
  reportsList = cache(async (options: {
    params: z.infer<typeof ReportsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ReportsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsListResponseSchema>>(
      'GET',
      '/reports/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsListResponseSchema
      }
    )
  })

  /**
   * POST /reports/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsCreateResponseSchema>>>
   * @example
   * const result = await client.reportsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  reportsCreate = async (options: {
    body: z.infer<typeof ReportsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ReportsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ReportsCreateResponseSchema>>(
      'POST',
      '/reports/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsCreateResponseSchema
      }
    )
  }

  /**
   * Get list of available models for reporting
   * Get list of available models for reporting
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsAvailableModelsResponseSchema>>>
   * @example
   * const result = await client.reportsAvailableModels({
   *   config: { timeout: 5000 }
   * })
   */
  reportsAvailableModels = cache(async (options: {
    params: z.infer<typeof ReportsAvailableModelsParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ReportsAvailableModelsParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsAvailableModelsResponseSchema>>(
      'GET',
      '/reports/available_models/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsAvailableModelsResponseSchema
      }
    )
  })

  /**
   * Validate a query configuration
   * Validate a query configuration
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsValidateQueryResponseSchema>>>
   * @example
   * const result = await client.reportsValidateQuery({
   *   config: { timeout: 5000 }
   * })
   */
  reportsValidateQuery = async (options: {
    body: z.infer<typeof ReportsValidateQueryRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ReportsValidateQueryRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ReportsValidateQueryResponseSchema>>(
      'POST',
      '/reports/validate_query/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsValidateQueryResponseSchema
      }
    )
  }

  /**
   * GET /reports/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsReadResponseSchema>>>
   * @example
   * const result = await client.reportsRead({
   *   config: { timeout: 5000 }
   * })
   */
  reportsRead = cache(async (options: {
    params: z.infer<typeof ReportsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ReportsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsReadResponseSchema>>(
      'GET',
      '/reports/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsReadResponseSchema
      }
    )
  })

  /**
   * PUT /reports/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsUpdateResponseSchema>>>
   * @example
   * const result = await client.reportsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  reportsUpdate = async (options: {
    params: z.infer<typeof ReportsUpdateParamsSchema>
    body: z.infer<typeof ReportsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ReportsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ReportsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsUpdateResponseSchema>>(
      'PUT',
      '/reports/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /reports/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.reportsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  reportsPartialUpdate = async (options: {
    params: z.infer<typeof ReportsPartialUpdateParamsSchema>
    body: z.infer<typeof ReportsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ReportsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ReportsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsPartialUpdateResponseSchema>>(
      'PATCH',
      '/reports/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /reports/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsDeleteResponseSchema>>>
   * @example
   * const result = await client.reportsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  reportsDelete = async (options: {
    params: z.infer<typeof ReportsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ReportsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsDeleteResponseSchema>>(
      'DELETE',
      '/reports/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsDeleteResponseSchema
      }
    )
  }

  /**
   * Execute a report and return JSON data
   * Execute a report and return JSON data
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsExecuteResponseSchema>>>
   * @example
   * const result = await client.reportsExecute({
   *   config: { timeout: 5000 }
   * })
   */
  reportsExecute = async (options: {
    params: z.infer<typeof ReportsExecuteParamsSchema>
    body: z.infer<typeof ReportsExecuteRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ReportsExecuteRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ReportsExecuteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsExecuteResponseSchema>>(
      'POST',
      '/reports/{id}/execute/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsExecuteResponseSchema
      }
    )
  }

  /**
   * Preview report structure without executing
   * Preview report structure without executing
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ReportsPreviewResponseSchema>>>
   * @example
   * const result = await client.reportsPreview({
   *   config: { timeout: 5000 }
   * })
   */
  reportsPreview = cache(async (options: {
    params: z.infer<typeof ReportsPreviewParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ReportsPreviewParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ReportsPreviewResponseSchema>>(
      'GET',
      '/reports/{id}/preview/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ReportsPreviewResponseSchema
      }
    )
  })
}