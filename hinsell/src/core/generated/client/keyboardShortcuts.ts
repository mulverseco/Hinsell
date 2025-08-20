import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  KeyboardShortcutsListResponseSchema,
  KeyboardShortcutsListParamsSchema,
  KeyboardShortcutsCreateRequestSchema,
  KeyboardShortcutsCreateResponseSchema,
  KeyboardShortcutsReadResponseSchema,
  KeyboardShortcutsReadParamsSchema,
  KeyboardShortcutsUpdateRequestSchema,
  KeyboardShortcutsUpdateResponseSchema,
  KeyboardShortcutsUpdateParamsSchema,
  KeyboardShortcutsPartialUpdateRequestSchema,
  KeyboardShortcutsPartialUpdateResponseSchema,
  KeyboardShortcutsPartialUpdateParamsSchema,
  KeyboardShortcutsDeleteResponseSchema,
  KeyboardShortcutsDeleteParamsSchema
} from '@/core/generated/schemas'

export class KeyboardShortcutsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'keyboardShortcuts-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'keyboardShortcuts'
          }
        }
      }
    })
  }

  /**
   * GET /keyboard-shortcuts/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof KeyboardShortcutsListResponseSchema>>>
   * @example
   * const result = await client.keyboardShortcutsList({
   *   config: { timeout: 5000 }
   * })
   */
  keyboardShortcutsList = cache(async (options: {
    params: z.infer<typeof KeyboardShortcutsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await KeyboardShortcutsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof KeyboardShortcutsListResponseSchema>>(
      'GET',
      '/keyboard-shortcuts/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: KeyboardShortcutsListResponseSchema
      }
    )
  })

  /**
   * POST /keyboard-shortcuts/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof KeyboardShortcutsCreateResponseSchema>>>
   * @example
   * const result = await client.keyboardShortcutsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  keyboardShortcutsCreate = async (options: {
    body: z.infer<typeof KeyboardShortcutsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await KeyboardShortcutsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof KeyboardShortcutsCreateResponseSchema>>(
      'POST',
      '/keyboard-shortcuts/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: KeyboardShortcutsCreateResponseSchema
      }
    )
  }

  /**
   * GET /keyboard-shortcuts/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof KeyboardShortcutsReadResponseSchema>>>
   * @example
   * const result = await client.keyboardShortcutsRead({
   *   config: { timeout: 5000 }
   * })
   */
  keyboardShortcutsRead = cache(async (options: {
    params: z.infer<typeof KeyboardShortcutsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await KeyboardShortcutsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof KeyboardShortcutsReadResponseSchema>>(
      'GET',
      '/keyboard-shortcuts/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: KeyboardShortcutsReadResponseSchema
      }
    )
  })

  /**
   * PUT /keyboard-shortcuts/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof KeyboardShortcutsUpdateResponseSchema>>>
   * @example
   * const result = await client.keyboardShortcutsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  keyboardShortcutsUpdate = async (options: {
    params: z.infer<typeof KeyboardShortcutsUpdateParamsSchema>
    body: z.infer<typeof KeyboardShortcutsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await KeyboardShortcutsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await KeyboardShortcutsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof KeyboardShortcutsUpdateResponseSchema>>(
      'PUT',
      '/keyboard-shortcuts/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: KeyboardShortcutsUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /keyboard-shortcuts/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof KeyboardShortcutsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.keyboardShortcutsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  keyboardShortcutsPartialUpdate = async (options: {
    params: z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema>
    body: z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await KeyboardShortcutsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await KeyboardShortcutsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof KeyboardShortcutsPartialUpdateResponseSchema>>(
      'PATCH',
      '/keyboard-shortcuts/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: KeyboardShortcutsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /keyboard-shortcuts/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof KeyboardShortcutsDeleteResponseSchema>>>
   * @example
   * const result = await client.keyboardShortcutsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  keyboardShortcutsDelete = async (options: {
    params: z.infer<typeof KeyboardShortcutsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await KeyboardShortcutsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof KeyboardShortcutsDeleteResponseSchema>>(
      'DELETE',
      '/keyboard-shortcuts/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: KeyboardShortcutsDeleteResponseSchema
      }
    )
  }
}