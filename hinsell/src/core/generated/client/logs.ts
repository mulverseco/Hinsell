import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  LogsListResponseSchema,
  LogsListParamsSchema,
  LogsReadResponseSchema,
  LogsReadParamsSchema
} from '@/core/generated/schemas'

export class LogsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'logs-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'logs'
          }
        }
      }
    })
  }

  /**
   * ViewSet for viewing notification logs.
   * ViewSet for viewing notification logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LogsListResponseSchema>>>
   * @example
   * const result = await client.logsList({
   *   config: { timeout: 5000 }
   * })
   */
  logsList = cache(async (options: {
    params: z.infer<typeof LogsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LogsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LogsListResponseSchema>>(
      'GET',
      '/logs/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LogsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for viewing notification logs.
   * ViewSet for viewing notification logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LogsReadResponseSchema>>>
   * @example
   * const result = await client.logsRead({
   *   config: { timeout: 5000 }
   * })
   */
  logsRead = cache(async (options: {
    params: z.infer<typeof LogsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LogsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LogsReadResponseSchema>>(
      'GET',
      '/logs/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LogsReadResponseSchema
      }
    )
  })
}