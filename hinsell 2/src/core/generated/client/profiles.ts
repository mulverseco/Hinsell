import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ProfilesListResponseSchema,
  ProfilesListParamsSchema,
  ProfilesCreateRequestSchema,
  ProfilesCreateResponseSchema,
  ProfilesReadResponseSchema,
  ProfilesReadParamsSchema,
  ProfilesUpdateRequestSchema,
  ProfilesUpdateResponseSchema,
  ProfilesUpdateParamsSchema,
  ProfilesPartialUpdateRequestSchema,
  ProfilesPartialUpdateResponseSchema,
  ProfilesPartialUpdateParamsSchema,
  ProfilesDeleteResponseSchema,
  ProfilesDeleteParamsSchema,
  ProfilesWithdrawConsentRequestSchema,
  ProfilesWithdrawConsentResponseSchema,
  ProfilesWithdrawConsentParamsSchema
} from '@/core/generated/schemas'

export class ProfilesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'profiles-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'profiles'
          }
        }
      }
    })
  }

  /**
   * GET /profiles/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesListResponseSchema>>>
   * @example
   * const result = await client.profilesList({
   *   config: { timeout: 5000 }
   * })
   */
  profilesList = cache(async (options: {
    params: z.infer<typeof ProfilesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ProfilesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ProfilesListResponseSchema>>(
      'GET',
      '/profiles/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesListResponseSchema
      }
    )
  })

  /**
   * POST /profiles/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesCreateResponseSchema>>>
   * @example
   * const result = await client.profilesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  profilesCreate = async (options: {
    body: z.infer<typeof ProfilesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ProfilesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ProfilesCreateResponseSchema>>(
      'POST',
      '/profiles/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesCreateResponseSchema
      }
    )
  }

  /**
   * GET /profiles/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesReadResponseSchema>>>
   * @example
   * const result = await client.profilesRead({
   *   config: { timeout: 5000 }
   * })
   */
  profilesRead = cache(async (options: {
    params: z.infer<typeof ProfilesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ProfilesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ProfilesReadResponseSchema>>(
      'GET',
      '/profiles/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesReadResponseSchema
      }
    )
  })

  /**
   * PUT /profiles/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesUpdateResponseSchema>>>
   * @example
   * const result = await client.profilesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  profilesUpdate = async (options: {
    params: z.infer<typeof ProfilesUpdateParamsSchema>
    body: z.infer<typeof ProfilesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ProfilesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ProfilesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ProfilesUpdateResponseSchema>>(
      'PUT',
      '/profiles/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /profiles/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.profilesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  profilesPartialUpdate = async (options: {
    params: z.infer<typeof ProfilesPartialUpdateParamsSchema>
    body: z.infer<typeof ProfilesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ProfilesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ProfilesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ProfilesPartialUpdateResponseSchema>>(
      'PATCH',
      '/profiles/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /profiles/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesDeleteResponseSchema>>>
   * @example
   * const result = await client.profilesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  profilesDelete = async (options: {
    params: z.infer<typeof ProfilesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ProfilesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ProfilesDeleteResponseSchema>>(
      'DELETE',
      '/profiles/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesDeleteResponseSchema
      }
    )
  }

  /**
   * POST /profiles/{id}/withdraw_consent/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ProfilesWithdrawConsentResponseSchema>>>
   * @example
   * const result = await client.profilesWithdrawConsent({
   *   config: { timeout: 5000 }
   * })
   */
  profilesWithdrawConsent = async (options: {
    params: z.infer<typeof ProfilesWithdrawConsentParamsSchema>
    body: z.infer<typeof ProfilesWithdrawConsentRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ProfilesWithdrawConsentRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ProfilesWithdrawConsentParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ProfilesWithdrawConsentResponseSchema>>(
      'POST',
      '/profiles/{id}/withdraw_consent/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ProfilesWithdrawConsentResponseSchema
      }
    )
  }
}