import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CompaniesListResponseSchema,
  CompaniesListParamsSchema,
  CompaniesCreateRequestSchema,
  CompaniesCreateResponseSchema,
  CompaniesReadResponseSchema,
  CompaniesReadParamsSchema,
  CompaniesUpdateRequestSchema,
  CompaniesUpdateResponseSchema,
  CompaniesUpdateParamsSchema,
  CompaniesPartialUpdateRequestSchema,
  CompaniesPartialUpdateResponseSchema,
  CompaniesPartialUpdateParamsSchema,
  CompaniesDeleteResponseSchema,
  CompaniesDeleteParamsSchema
} from '@/core/generated/schemas'

export class CompaniesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'companies-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'companies'
          }
        }
      }
    })
  }

  /**
   * GET /companies/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CompaniesListResponseSchema>>>
   * @example
   * const result = await client.companiesList({
   *   config: { timeout: 5000 }
   * })
   */
  companiesList = cache(async (options: {
    params: z.infer<typeof CompaniesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CompaniesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CompaniesListResponseSchema>>(
      'GET',
      '/companies/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CompaniesListResponseSchema
      }
    )
  })

  /**
   * POST /companies/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CompaniesCreateResponseSchema>>>
   * @example
   * const result = await client.companiesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  companiesCreate = async (options: {
    body: z.infer<typeof CompaniesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CompaniesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof CompaniesCreateResponseSchema>>(
      'POST',
      '/companies/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CompaniesCreateResponseSchema
      }
    )
  }

  /**
   * GET /companies/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CompaniesReadResponseSchema>>>
   * @example
   * const result = await client.companiesRead({
   *   config: { timeout: 5000 }
   * })
   */
  companiesRead = cache(async (options: {
    params: z.infer<typeof CompaniesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CompaniesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CompaniesReadResponseSchema>>(
      'GET',
      '/companies/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CompaniesReadResponseSchema
      }
    )
  })

  /**
   * PUT /companies/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CompaniesUpdateResponseSchema>>>
   * @example
   * const result = await client.companiesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  companiesUpdate = async (options: {
    params: z.infer<typeof CompaniesUpdateParamsSchema>
    body: z.infer<typeof CompaniesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CompaniesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CompaniesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CompaniesUpdateResponseSchema>>(
      'PUT',
      '/companies/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CompaniesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /companies/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CompaniesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.companiesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  companiesPartialUpdate = async (options: {
    params: z.infer<typeof CompaniesPartialUpdateParamsSchema>
    body: z.infer<typeof CompaniesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CompaniesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CompaniesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CompaniesPartialUpdateResponseSchema>>(
      'PATCH',
      '/companies/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CompaniesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /companies/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CompaniesDeleteResponseSchema>>>
   * @example
   * const result = await client.companiesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  companiesDelete = async (options: {
    params: z.infer<typeof CompaniesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CompaniesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CompaniesDeleteResponseSchema>>(
      'DELETE',
      '/companies/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CompaniesDeleteResponseSchema
      }
    )
  }
}