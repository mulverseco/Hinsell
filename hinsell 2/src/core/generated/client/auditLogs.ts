import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  AuditLogsListResponseSchema,
  AuditLogsListParamsSchema,
  AuditLogsCreateRequestSchema,
  AuditLogsCreateResponseSchema,
  AuditLogsReadResponseSchema,
  AuditLogsReadParamsSchema,
  AuditLogsUpdateRequestSchema,
  AuditLogsUpdateResponseSchema,
  AuditLogsUpdateParamsSchema,
  AuditLogsPartialUpdateRequestSchema,
  AuditLogsPartialUpdateResponseSchema,
  AuditLogsPartialUpdateParamsSchema,
  AuditLogsDeleteResponseSchema,
  AuditLogsDeleteParamsSchema
} from '@/core/generated/schemas'

export class AuditLogsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'auditLogs-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'auditLogs'
          }
        }
      }
    })
  }

  /**
   * ViewSet for viewing AuditLog instances (admin only).
   * ViewSet for viewing AuditLog instances (admin only).
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuditLogsListResponseSchema>>>
   * @example
   * const result = await client.auditLogsList({
   *   config: { timeout: 5000 }
   * })
   */
  auditLogsList = cache(async (options: {
    params: z.infer<typeof AuditLogsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AuditLogsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuditLogsListResponseSchema>>(
      'GET',
      '/audit-logs/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuditLogsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for viewing AuditLog instances (admin only).
   * ViewSet for viewing AuditLog instances (admin only).
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuditLogsCreateResponseSchema>>>
   * @example
   * const result = await client.auditLogsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  auditLogsCreate = async (options: {
    body: z.infer<typeof AuditLogsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuditLogsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof AuditLogsCreateResponseSchema>>(
      'POST',
      '/audit-logs/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuditLogsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for viewing AuditLog instances (admin only).
   * ViewSet for viewing AuditLog instances (admin only).
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuditLogsReadResponseSchema>>>
   * @example
   * const result = await client.auditLogsRead({
   *   config: { timeout: 5000 }
   * })
   */
  auditLogsRead = cache(async (options: {
    params: z.infer<typeof AuditLogsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AuditLogsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuditLogsReadResponseSchema>>(
      'GET',
      '/audit-logs/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuditLogsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for viewing AuditLog instances (admin only).
   * ViewSet for viewing AuditLog instances (admin only).
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuditLogsUpdateResponseSchema>>>
   * @example
   * const result = await client.auditLogsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  auditLogsUpdate = async (options: {
    params: z.infer<typeof AuditLogsUpdateParamsSchema>
    body: z.infer<typeof AuditLogsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuditLogsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AuditLogsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuditLogsUpdateResponseSchema>>(
      'PUT',
      '/audit-logs/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuditLogsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for viewing AuditLog instances (admin only).
   * ViewSet for viewing AuditLog instances (admin only).
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuditLogsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.auditLogsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  auditLogsPartialUpdate = async (options: {
    params: z.infer<typeof AuditLogsPartialUpdateParamsSchema>
    body: z.infer<typeof AuditLogsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await AuditLogsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await AuditLogsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuditLogsPartialUpdateResponseSchema>>(
      'PATCH',
      '/audit-logs/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuditLogsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for viewing AuditLog instances (admin only).
   * ViewSet for viewing AuditLog instances (admin only).
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof AuditLogsDeleteResponseSchema>>>
   * @example
   * const result = await client.auditLogsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  auditLogsDelete = async (options: {
    params: z.infer<typeof AuditLogsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await AuditLogsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof AuditLogsDeleteResponseSchema>>(
      'DELETE',
      '/audit-logs/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: AuditLogsDeleteResponseSchema
      }
    )
  }
}