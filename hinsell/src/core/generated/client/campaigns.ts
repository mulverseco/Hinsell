import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  CampaignsListResponseSchema,
  CampaignsListParamsSchema,
  CampaignsCreateRequestSchema,
  CampaignsCreateResponseSchema,
  CampaignsReadResponseSchema,
  CampaignsReadParamsSchema,
  CampaignsUpdateRequestSchema,
  CampaignsUpdateResponseSchema,
  CampaignsUpdateParamsSchema,
  CampaignsPartialUpdateRequestSchema,
  CampaignsPartialUpdateResponseSchema,
  CampaignsPartialUpdateParamsSchema,
  CampaignsDeleteResponseSchema,
  CampaignsDeleteParamsSchema,
  CampaignsTrackClickRequestSchema,
  CampaignsTrackClickResponseSchema,
  CampaignsTrackClickParamsSchema,
  CampaignsTrackConversionRequestSchema,
  CampaignsTrackConversionResponseSchema,
  CampaignsTrackConversionParamsSchema,
  CampaignsTrackImpressionRequestSchema,
  CampaignsTrackImpressionResponseSchema,
  CampaignsTrackImpressionParamsSchema
} from '@/core/generated/schemas'

export class CampaignsApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'campaigns-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'campaigns'
          }
        }
      }
    })
  }

  /**
   * GET /campaigns/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsListResponseSchema>>>
   * @example
   * const result = await client.campaignsList({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsList = cache(async (options: {
    params: z.infer<typeof CampaignsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CampaignsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsListResponseSchema>>(
      'GET',
      '/campaigns/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsListResponseSchema
      }
    )
  })

  /**
   * POST /campaigns/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsCreateResponseSchema>>>
   * @example
   * const result = await client.campaignsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsCreate = async (options: {
    body: z.infer<typeof CampaignsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CampaignsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof CampaignsCreateResponseSchema>>(
      'POST',
      '/campaigns/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsCreateResponseSchema
      }
    )
  }

  /**
   * GET /campaigns/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsReadResponseSchema>>>
   * @example
   * const result = await client.campaignsRead({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsRead = cache(async (options: {
    params: z.infer<typeof CampaignsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CampaignsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsReadResponseSchema>>(
      'GET',
      '/campaigns/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsReadResponseSchema
      }
    )
  })

  /**
   * PUT /campaigns/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsUpdateResponseSchema>>>
   * @example
   * const result = await client.campaignsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsUpdate = async (options: {
    params: z.infer<typeof CampaignsUpdateParamsSchema>
    body: z.infer<typeof CampaignsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CampaignsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CampaignsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsUpdateResponseSchema>>(
      'PUT',
      '/campaigns/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsUpdateResponseSchema
      }
    )
  }

  /**
   * PATCH /campaigns/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.campaignsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsPartialUpdate = async (options: {
    params: z.infer<typeof CampaignsPartialUpdateParamsSchema>
    body: z.infer<typeof CampaignsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CampaignsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CampaignsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsPartialUpdateResponseSchema>>(
      'PATCH',
      '/campaigns/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * DELETE /campaigns/{id}/
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsDeleteResponseSchema>>>
   * @example
   * const result = await client.campaignsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsDelete = async (options: {
    params: z.infer<typeof CampaignsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await CampaignsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsDeleteResponseSchema>>(
      'DELETE',
      '/campaigns/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsDeleteResponseSchema
      }
    )
  }

  /**
   * Track a campaign click.
   * Track a campaign click.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsTrackClickResponseSchema>>>
   * @example
   * const result = await client.campaignsTrackClick({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsTrackClick = async (options: {
    params: z.infer<typeof CampaignsTrackClickParamsSchema>
    body: z.infer<typeof CampaignsTrackClickRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CampaignsTrackClickRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CampaignsTrackClickParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsTrackClickResponseSchema>>(
      'POST',
      '/campaigns/{id}/track_click/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsTrackClickResponseSchema
      }
    )
  }

  /**
   * Track a campaign conversion.
   * Track a campaign conversion.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsTrackConversionResponseSchema>>>
   * @example
   * const result = await client.campaignsTrackConversion({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsTrackConversion = async (options: {
    params: z.infer<typeof CampaignsTrackConversionParamsSchema>
    body: z.infer<typeof CampaignsTrackConversionRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CampaignsTrackConversionRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CampaignsTrackConversionParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsTrackConversionResponseSchema>>(
      'POST',
      '/campaigns/{id}/track_conversion/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsTrackConversionResponseSchema
      }
    )
  }

  /**
   * Track a campaign impression.
   * Track a campaign impression.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof CampaignsTrackImpressionResponseSchema>>>
   * @example
   * const result = await client.campaignsTrackImpression({
   *   config: { timeout: 5000 }
   * })
   */
  campaignsTrackImpression = async (options: {
    params: z.infer<typeof CampaignsTrackImpressionParamsSchema>
    body: z.infer<typeof CampaignsTrackImpressionRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await CampaignsTrackImpressionRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await CampaignsTrackImpressionParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof CampaignsTrackImpressionResponseSchema>>(
      'POST',
      '/campaigns/{id}/track_impression/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: CampaignsTrackImpressionResponseSchema
      }
    )
  }
}