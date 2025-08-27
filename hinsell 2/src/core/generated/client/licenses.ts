import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  LicensesListResponseSchema,
  LicensesListParamsSchema,
  LicensesCreateRequestSchema,
  LicensesCreateResponseSchema,
  LicensesReadResponseSchema,
  LicensesReadParamsSchema,
  LicensesUpdateRequestSchema,
  LicensesUpdateResponseSchema,
  LicensesUpdateParamsSchema,
  LicensesPartialUpdateRequestSchema,
  LicensesPartialUpdateResponseSchema,
  LicensesPartialUpdateParamsSchema,
  LicensesDeleteResponseSchema,
  LicensesDeleteParamsSchema,
  LicensesValidateRequestSchema,
  LicensesValidateResponseSchema,
  LicensesValidateParamsSchema
} from '@/core/generated/schemas'

export class LicensesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'licenses-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'licenses'
          }
        }
      }
    })
  }

  /**
   * GET /licenses/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesListResponseSchema>>>
   * @example
   * const result = await client.licensesList({
   *   config: { timeout: 5000 }
   * })
   */
  licensesList = cache(async (options: {
    params: z.infer<typeof LicensesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LicensesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicensesListResponseSchema>>(
      'GET',
      '/licenses/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesListResponseSchema
      }
    )
  })

  /**
   * POST /licenses/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesCreateResponseSchema>>>
   * @example
   * const result = await client.licensesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  licensesCreate = async (options: {
    body: z.infer<typeof LicensesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicensesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof LicensesCreateResponseSchema>>(
      'POST',
      '/licenses/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesCreateResponseSchema
      }
    )
  }

  /**
   * GET /licenses/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesReadResponseSchema>>>
   * @example
   * const result = await client.licensesRead({
   *   config: { timeout: 5000 }
   * })
   */
  licensesRead = cache(async (options: {
    params: z.infer<typeof LicensesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LicensesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicensesReadResponseSchema>>(
      'GET',
      '/licenses/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesReadResponseSchema
      }
    )
  })

  /**
   * PUT /licenses/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesUpdateResponseSchema>>>
   * @example
   * const result = await client.licensesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  licensesUpdate = async (options: {
    params: z.infer<typeof LicensesUpdateParamsSchema>
    body: z.infer<typeof LicensesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicensesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LicensesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicensesUpdateResponseSchema>>(
      'PUT',
      '/licenses/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /licenses/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.licensesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  licensesPartialUpdate = async (options: {
    params: z.infer<typeof LicensesPartialUpdateParamsSchema>
    body: z.infer<typeof LicensesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicensesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LicensesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicensesPartialUpdateResponseSchema>>(
      'PATCH',
      '/licenses/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /licenses/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesDeleteResponseSchema>>>
   * @example
   * const result = await client.licensesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  licensesDelete = async (options: {
    params: z.infer<typeof LicensesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await LicensesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicensesDeleteResponseSchema>>(
      'DELETE',
      '/licenses/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesDeleteResponseSchema
      }
    )
  }

  /**
   * POST /licenses/{id}/validate/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof LicensesValidateResponseSchema>>>
   * @example
   * const result = await client.licensesValidate({
   *   config: { timeout: 5000 }
   * })
   */
  licensesValidate = async (options: {
    params: z.infer<typeof LicensesValidateParamsSchema>
    body: z.infer<typeof LicensesValidateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await LicensesValidateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await LicensesValidateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof LicensesValidateResponseSchema>>(
      'POST',
      '/licenses/{id}/validate/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: LicensesValidateResponseSchema
      }
    )
  }
}