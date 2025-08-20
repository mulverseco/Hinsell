import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  TemplatesListResponseSchema,
  TemplatesListParamsSchema,
  TemplatesCreateRequestSchema,
  TemplatesCreateResponseSchema,
  TemplatesReadResponseSchema,
  TemplatesReadParamsSchema,
  TemplatesUpdateRequestSchema,
  TemplatesUpdateResponseSchema,
  TemplatesUpdateParamsSchema,
  TemplatesPartialUpdateRequestSchema,
  TemplatesPartialUpdateResponseSchema,
  TemplatesPartialUpdateParamsSchema,
  TemplatesDeleteResponseSchema,
  TemplatesDeleteParamsSchema
} from '@/core/generated/schemas'

export class TemplatesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'templates-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'templates'
          }
        }
      }
    })
  }

  /**
   * ViewSet for managing notification templates.
   * ViewSet for managing notification templates.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TemplatesListResponseSchema>>>
   * @example
   * const result = await client.templatesList({
   *   config: { timeout: 5000 }
   * })
   */
  templatesList = cache(async (options: {
    params: z.infer<typeof TemplatesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TemplatesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TemplatesListResponseSchema>>(
      'GET',
      '/templates/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TemplatesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing notification templates.
   * ViewSet for managing notification templates.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TemplatesCreateResponseSchema>>>
   * @example
   * const result = await client.templatesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  templatesCreate = async (options: {
    body: z.infer<typeof TemplatesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TemplatesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof TemplatesCreateResponseSchema>>(
      'POST',
      '/templates/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TemplatesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing notification templates.
   * ViewSet for managing notification templates.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TemplatesReadResponseSchema>>>
   * @example
   * const result = await client.templatesRead({
   *   config: { timeout: 5000 }
   * })
   */
  templatesRead = cache(async (options: {
    params: z.infer<typeof TemplatesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TemplatesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TemplatesReadResponseSchema>>(
      'GET',
      '/templates/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TemplatesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for managing notification templates.
   * ViewSet for managing notification templates.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TemplatesUpdateResponseSchema>>>
   * @example
   * const result = await client.templatesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  templatesUpdate = async (options: {
    params: z.infer<typeof TemplatesUpdateParamsSchema>
    body: z.infer<typeof TemplatesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TemplatesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TemplatesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TemplatesUpdateResponseSchema>>(
      'PUT',
      '/templates/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TemplatesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing notification templates.
   * ViewSet for managing notification templates.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TemplatesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.templatesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  templatesPartialUpdate = async (options: {
    params: z.infer<typeof TemplatesPartialUpdateParamsSchema>
    body: z.infer<typeof TemplatesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await TemplatesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await TemplatesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TemplatesPartialUpdateResponseSchema>>(
      'PATCH',
      '/templates/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TemplatesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for managing notification templates.
   * ViewSet for managing notification templates.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof TemplatesDeleteResponseSchema>>>
   * @example
   * const result = await client.templatesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  templatesDelete = async (options: {
    params: z.infer<typeof TemplatesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await TemplatesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof TemplatesDeleteResponseSchema>>(
      'DELETE',
      '/templates/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: TemplatesDeleteResponseSchema
      }
    )
  }
}