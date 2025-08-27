import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  SystemSettingsListResponseSchema,
  SystemSettingsListParamsSchema,
  SystemSettingsCreateRequestSchema,
  SystemSettingsCreateResponseSchema,
  SystemSettingsReadResponseSchema,
  SystemSettingsReadParamsSchema,
  SystemSettingsUpdateRequestSchema,
  SystemSettingsUpdateResponseSchema,
  SystemSettingsUpdateParamsSchema,
  SystemSettingsPartialUpdateRequestSchema,
  SystemSettingsPartialUpdateResponseSchema,
  SystemSettingsPartialUpdateParamsSchema,
  SystemSettingsDeleteResponseSchema,
  SystemSettingsDeleteParamsSchema
} from '@/core/generated/schemas'

export class SystemSettingsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'systemSettings-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'systemSettings'
          }
        }
      }
    })
  }

  /**
   * GET /system-settings/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SystemSettingsListResponseSchema>>>
   * @example
   * const result = await client.systemSettingsList({
   *   config: { timeout: 5000 }
   * })
   */
  systemSettingsList = cache(async (options: {
    params: z.infer<typeof SystemSettingsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await SystemSettingsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SystemSettingsListResponseSchema>>(
      'GET',
      '/system-settings/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SystemSettingsListResponseSchema
      }
    )
  })

  /**
   * POST /system-settings/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SystemSettingsCreateResponseSchema>>>
   * @example
   * const result = await client.systemSettingsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  systemSettingsCreate = async (options: {
    body: z.infer<typeof SystemSettingsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await SystemSettingsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof SystemSettingsCreateResponseSchema>>(
      'POST',
      '/system-settings/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SystemSettingsCreateResponseSchema
      }
    )
  }

  /**
   * GET /system-settings/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SystemSettingsReadResponseSchema>>>
   * @example
   * const result = await client.systemSettingsRead({
   *   config: { timeout: 5000 }
   * })
   */
  systemSettingsRead = cache(async (options: {
    params: z.infer<typeof SystemSettingsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await SystemSettingsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SystemSettingsReadResponseSchema>>(
      'GET',
      '/system-settings/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SystemSettingsReadResponseSchema
      }
    )
  })

  /**
   * PUT /system-settings/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SystemSettingsUpdateResponseSchema>>>
   * @example
   * const result = await client.systemSettingsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  systemSettingsUpdate = async (options: {
    params: z.infer<typeof SystemSettingsUpdateParamsSchema>
    body: z.infer<typeof SystemSettingsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await SystemSettingsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await SystemSettingsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SystemSettingsUpdateResponseSchema>>(
      'PUT',
      '/system-settings/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SystemSettingsUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /system-settings/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SystemSettingsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.systemSettingsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  systemSettingsPartialUpdate = async (options: {
    params: z.infer<typeof SystemSettingsPartialUpdateParamsSchema>
    body: z.infer<typeof SystemSettingsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await SystemSettingsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await SystemSettingsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SystemSettingsPartialUpdateResponseSchema>>(
      'PATCH',
      '/system-settings/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SystemSettingsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /system-settings/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof SystemSettingsDeleteResponseSchema>>>
   * @example
   * const result = await client.systemSettingsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  systemSettingsDelete = async (options: {
    params: z.infer<typeof SystemSettingsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await SystemSettingsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof SystemSettingsDeleteResponseSchema>>(
      'DELETE',
      '/system-settings/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: SystemSettingsDeleteResponseSchema
      }
    )
  }
}