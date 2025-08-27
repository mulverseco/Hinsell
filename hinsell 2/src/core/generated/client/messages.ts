import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  MessagesListResponseSchema,
  MessagesListParamsSchema,
  MessagesCreateRequestSchema,
  MessagesCreateResponseSchema,
  MessagesReadResponseSchema,
  MessagesReadParamsSchema,
  MessagesUpdateRequestSchema,
  MessagesUpdateResponseSchema,
  MessagesUpdateParamsSchema,
  MessagesPartialUpdateRequestSchema,
  MessagesPartialUpdateResponseSchema,
  MessagesPartialUpdateParamsSchema,
  MessagesDeleteResponseSchema,
  MessagesDeleteParamsSchema,
  MessagesMarkAsReadRequestSchema,
  MessagesMarkAsReadResponseSchema,
  MessagesMarkAsReadParamsSchema
} from '@/core/generated/schemas'

export class MessagesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'messages-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'messages'
          }
        }
      }
    })
  }

  /**
   * ViewSet for managing internal messages.
   * ViewSet for managing internal messages.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesListResponseSchema>>>
   * @example
   * const result = await client.messagesList({
   *   config: { timeout: 5000 }
   * })
   */
  messagesList = cache(async (options: {
    params: z.infer<typeof MessagesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await MessagesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof MessagesListResponseSchema>>(
      'GET',
      '/messages/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing internal messages.
   * ViewSet for managing internal messages.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesCreateResponseSchema>>>
   * @example
   * const result = await client.messagesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  messagesCreate = async (options: {
    body: z.infer<typeof MessagesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await MessagesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof MessagesCreateResponseSchema>>(
      'POST',
      '/messages/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing internal messages.
   * ViewSet for managing internal messages.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesReadResponseSchema>>>
   * @example
   * const result = await client.messagesRead({
   *   config: { timeout: 5000 }
   * })
   */
  messagesRead = cache(async (options: {
    params: z.infer<typeof MessagesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await MessagesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof MessagesReadResponseSchema>>(
      'GET',
      '/messages/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing internal messages.
   * ViewSet for managing internal messages.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesUpdateResponseSchema>>>
   * @example
   * const result = await client.messagesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  messagesUpdate = async (options: {
    params: z.infer<typeof MessagesUpdateParamsSchema>
    body: z.infer<typeof MessagesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await MessagesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await MessagesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof MessagesUpdateResponseSchema>>(
      'PUT',
      '/messages/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing internal messages.
   * ViewSet for managing internal messages.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.messagesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  messagesPartialUpdate = async (options: {
    params: z.infer<typeof MessagesPartialUpdateParamsSchema>
    body: z.infer<typeof MessagesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await MessagesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await MessagesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof MessagesPartialUpdateResponseSchema>>(
      'PATCH',
      '/messages/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing internal messages.
   * ViewSet for managing internal messages.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesDeleteResponseSchema>>>
   * @example
   * const result = await client.messagesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  messagesDelete = async (options: {
    params: z.infer<typeof MessagesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await MessagesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof MessagesDeleteResponseSchema>>(
      'DELETE',
      '/messages/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesDeleteResponseSchema
      }
    )
  }

  /**
   * Mark an internal message as read.
   * Mark an internal message as read.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof MessagesMarkAsReadResponseSchema>>>
   * @example
   * const result = await client.messagesMarkAsRead({
   *   config: { timeout: 5000 }
   * })
   */
  messagesMarkAsRead = async (options: {
    params: z.infer<typeof MessagesMarkAsReadParamsSchema>
    body: z.infer<typeof MessagesMarkAsReadRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await MessagesMarkAsReadRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await MessagesMarkAsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof MessagesMarkAsReadResponseSchema>>(
      'POST',
      '/messages/{id}/mark_as_read/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: MessagesMarkAsReadResponseSchema
      }
    )
  }
}