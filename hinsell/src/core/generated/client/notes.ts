import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  NotesListResponseSchema,
  NotesListParamsSchema,
  NotesCreateRequestSchema,
  NotesCreateResponseSchema,
  NotesReadResponseSchema,
  NotesReadParamsSchema,
  NotesUpdateRequestSchema,
  NotesUpdateResponseSchema,
  NotesUpdateParamsSchema,
  NotesPartialUpdateRequestSchema,
  NotesPartialUpdateResponseSchema,
  NotesPartialUpdateParamsSchema,
  NotesDeleteResponseSchema,
  NotesDeleteParamsSchema,
  NotesMarkReminderSentRequestSchema,
  NotesMarkReminderSentResponseSchema,
  NotesMarkReminderSentParamsSchema
} from '@/core/generated/schemas'

export class NotesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'notes-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'notes'
          }
        }
      }
    })
  }

  /**
   * ViewSet for managing user notes.
   * ViewSet for managing user notes.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesListResponseSchema>>>
   * @example
   * const result = await client.notesList({
   *   config: { timeout: 5000 }
   * })
   */
  notesList = cache(async (options: {
    params: z.infer<typeof NotesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await NotesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotesListResponseSchema>>(
      'GET',
      '/notes/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing user notes.
   * ViewSet for managing user notes.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesCreateResponseSchema>>>
   * @example
   * const result = await client.notesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  notesCreate = async (options: {
    body: z.infer<typeof NotesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof NotesCreateResponseSchema>>(
      'POST',
      '/notes/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing user notes.
   * ViewSet for managing user notes.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesReadResponseSchema>>>
   * @example
   * const result = await client.notesRead({
   *   config: { timeout: 5000 }
   * })
   */
  notesRead = cache(async (options: {
    params: z.infer<typeof NotesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await NotesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotesReadResponseSchema>>(
      'GET',
      '/notes/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing user notes.
   * ViewSet for managing user notes.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesUpdateResponseSchema>>>
   * @example
   * const result = await client.notesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  notesUpdate = async (options: {
    params: z.infer<typeof NotesUpdateParamsSchema>
    body: z.infer<typeof NotesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await NotesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotesUpdateResponseSchema>>(
      'PUT',
      '/notes/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing user notes.
   * ViewSet for managing user notes.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.notesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  notesPartialUpdate = async (options: {
    params: z.infer<typeof NotesPartialUpdateParamsSchema>
    body: z.infer<typeof NotesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await NotesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotesPartialUpdateResponseSchema>>(
      'PATCH',
      '/notes/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing user notes.
   * ViewSet for managing user notes.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesDeleteResponseSchema>>>
   * @example
   * const result = await client.notesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  notesDelete = async (options: {
    params: z.infer<typeof NotesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await NotesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotesDeleteResponseSchema>>(
      'DELETE',
      '/notes/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesDeleteResponseSchema
      }
    )
  }

  /**
   * Mark a user note reminder as sent.
   * Mark a user note reminder as sent.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof NotesMarkReminderSentResponseSchema>>>
   * @example
   * const result = await client.notesMarkReminderSent({
   *   config: { timeout: 5000 }
   * })
   */
  notesMarkReminderSent = async (options: {
    params: z.infer<typeof NotesMarkReminderSentParamsSchema>
    body: z.infer<typeof NotesMarkReminderSentRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await NotesMarkReminderSentRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await NotesMarkReminderSentParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof NotesMarkReminderSentResponseSchema>>(
      'POST',
      '/notes/{id}/mark_reminder_sent/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: NotesMarkReminderSentResponseSchema
      }
    )
  }
}