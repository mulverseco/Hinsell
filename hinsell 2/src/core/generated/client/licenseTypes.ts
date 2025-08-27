import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  LicenseTypesListResponseSchema,
  LicenseTypesListParamsSchema,
  LicenseTypesCreateRequestSchema,
  LicenseTypesCreateResponseSchema,
  LicenseTypesReadResponseSchema,
  LicenseTypesReadParamsSchema,
  LicenseTypesUpdateRequestSchema,
  LicenseTypesUpdateResponseSchema,
  LicenseTypesUpdateParamsSchema,
  LicenseTypesPartialUpdateRequestSchema,
  LicenseTypesPartialUpdateResponseSchema,
  LicenseTypesPartialUpdateParamsSchema,
  LicenseTypesDeleteResponseSchema,
  LicenseTypesDeleteParamsSchema
} from '@/core/generated/schemas'

export class LicenseTypesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'licenseTypes-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'licenseTypes'
          }
        }
      }
    })
  }

  /**
   * GET /license-types/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicenseTypesListResponseSchema>>>
   * @example
   * const result = await client.licenseTypesList({
   *   config: { timeout: 5000 }
   * })
   */
  licenseTypesList = cache(async (options: {
    params: z.infer<typeof LicenseTypesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LicenseTypesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicenseTypesListResponseSchema>>(
      'GET',
      '/license-types/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicenseTypesListResponseSchema
      }
    )
  })

  /**
   * POST /license-types/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicenseTypesCreateResponseSchema>>>
   * @example
   * const result = await client.licenseTypesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  licenseTypesCreate = async (options: {
    body: z.infer<typeof LicenseTypesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicenseTypesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof LicenseTypesCreateResponseSchema>>(
      'POST',
      '/license-types/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicenseTypesCreateResponseSchema
      }
    )
  }

  /**
   * GET /license-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicenseTypesReadResponseSchema>>>
   * @example
   * const result = await client.licenseTypesRead({
   *   config: { timeout: 5000 }
   * })
   */
  licenseTypesRead = cache(async (options: {
    params: z.infer<typeof LicenseTypesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LicenseTypesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicenseTypesReadResponseSchema>>(
      'GET',
      '/license-types/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicenseTypesReadResponseSchema
      }
    )
  })

  /**
   * PUT /license-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicenseTypesUpdateResponseSchema>>>
   * @example
   * const result = await client.licenseTypesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  licenseTypesUpdate = async (options: {
    params: z.infer<typeof LicenseTypesUpdateParamsSchema>
    body: z.infer<typeof LicenseTypesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicenseTypesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LicenseTypesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicenseTypesUpdateResponseSchema>>(
      'PUT',
      '/license-types/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicenseTypesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /license-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicenseTypesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.licenseTypesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  licenseTypesPartialUpdate = async (options: {
    params: z.infer<typeof LicenseTypesPartialUpdateParamsSchema>
    body: z.infer<typeof LicenseTypesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicenseTypesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LicenseTypesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicenseTypesPartialUpdateResponseSchema>>(
      'PATCH',
      '/license-types/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicenseTypesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /license-types/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicenseTypesDeleteResponseSchema>>>
   * @example
   * const result = await client.licenseTypesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  licenseTypesDelete = async (options: {
    params: z.infer<typeof LicenseTypesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LicenseTypesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicenseTypesDeleteResponseSchema>>(
      'DELETE',
      '/license-types/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicenseTypesDeleteResponseSchema
      }
    )
  }
}