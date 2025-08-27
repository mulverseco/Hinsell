import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  NotificationsListResponseSchema,
  NotificationsListParamsSchema,
  NotificationsCreateRequestSchema,
  NotificationsCreateResponseSchema,
  NotificationsReadResponseSchema,
  NotificationsReadParamsSchema,
  NotificationsUpdateRequestSchema,
  NotificationsUpdateResponseSchema,
  NotificationsUpdateParamsSchema,
  NotificationsPartialUpdateRequestSchema,
  NotificationsPartialUpdateResponseSchema,
  NotificationsPartialUpdateParamsSchema,
  NotificationsDeleteResponseSchema,
  NotificationsDeleteParamsSchema,
  NotificationsMarkAsReadRequestSchema,
  NotificationsMarkAsReadResponseSchema,
  NotificationsMarkAsReadParamsSchema
} from '@/core/generated/schemas'

export class NotificationsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'notifications-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'notifications'
          }
        }
      }
    })
  }

  /**
   * ViewSet for managing notifications.
   * ViewSet for managing notifications.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsListResponseSchema>>>
   * @example
   * const result = await client.notificationsList({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsList = cache(async (options: {
    params: z.infer<typeof NotificationsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await NotificationsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotificationsListResponseSchema>>(
      'GET',
      '/notifications/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing notifications.
   * ViewSet for managing notifications.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsCreateResponseSchema>>>
   * @example
   * const result = await client.notificationsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsCreate = async (options: {
    body: z.infer<typeof NotificationsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotificationsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof NotificationsCreateResponseSchema>>(
      'POST',
      '/notifications/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing notifications.
   * ViewSet for managing notifications.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsReadResponseSchema>>>
   * @example
   * const result = await client.notificationsRead({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsRead = cache(async (options: {
    params: z.infer<typeof NotificationsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await NotificationsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotificationsReadResponseSchema>>(
      'GET',
      '/notifications/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing notifications.
   * ViewSet for managing notifications.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsUpdateResponseSchema>>>
   * @example
   * const result = await client.notificationsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsUpdate = async (options: {
    params: z.infer<typeof NotificationsUpdateParamsSchema>
    body: z.infer<typeof NotificationsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotificationsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await NotificationsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotificationsUpdateResponseSchema>>(
      'PUT',
      '/notifications/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing notifications.
   * ViewSet for managing notifications.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.notificationsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsPartialUpdate = async (options: {
    params: z.infer<typeof NotificationsPartialUpdateParamsSchema>
    body: z.infer<typeof NotificationsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotificationsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await NotificationsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotificationsPartialUpdateResponseSchema>>(
      'PATCH',
      '/notifications/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing notifications.
   * ViewSet for managing notifications.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsDeleteResponseSchema>>>
   * @example
   * const result = await client.notificationsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsDelete = async (options: {
    params: z.infer<typeof NotificationsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await NotificationsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotificationsDeleteResponseSchema>>(
      'DELETE',
      '/notifications/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsDeleteResponseSchema
      }
    )
  }

  /**
   * Mark a notification as read.
   * Mark a notification as read.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotificationsMarkAsReadResponseSchema>>>
   * @example
   * const result = await client.notificationsMarkAsRead({
   *   config: { timeout: 5000 }
   * })
   */
  notificationsMarkAsRead = async (options: {
    params: z.infer<typeof NotificationsMarkAsReadParamsSchema>
    body: z.infer<typeof NotificationsMarkAsReadRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotificationsMarkAsReadRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await NotificationsMarkAsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotificationsMarkAsReadResponseSchema>>(
      'POST',
      '/notifications/{id}/mark_as_read/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotificationsMarkAsReadResponseSchema
      }
    )
  }
}