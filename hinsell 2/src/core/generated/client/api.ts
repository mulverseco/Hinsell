import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ApiWebhooksDeliveriesListResponseSchema,
  ApiWebhooksDeliveriesListParamsSchema,
  ApiWebhooksDeliveriesCreateRequestSchema,
  ApiWebhooksDeliveriesCreateResponseSchema,
  ApiWebhooksDeliveriesReadResponseSchema,
  ApiWebhooksDeliveriesReadParamsSchema,
  ApiWebhooksDeliveriesUpdateRequestSchema,
  ApiWebhooksDeliveriesUpdateResponseSchema,
  ApiWebhooksDeliveriesUpdateParamsSchema,
  ApiWebhooksDeliveriesPartialUpdateRequestSchema,
  ApiWebhooksDeliveriesPartialUpdateResponseSchema,
  ApiWebhooksDeliveriesPartialUpdateParamsSchema,
  ApiWebhooksDeliveriesDeleteResponseSchema,
  ApiWebhooksDeliveriesDeleteParamsSchema,
  ApiWebhooksDeliveriesRetryRequestSchema,
  ApiWebhooksDeliveriesRetryResponseSchema,
  ApiWebhooksDeliveriesRetryParamsSchema,
  ApiWebhooksEndpointsListResponseSchema,
  ApiWebhooksEndpointsListParamsSchema,
  ApiWebhooksEndpointsCreateRequestSchema,
  ApiWebhooksEndpointsCreateResponseSchema,
  ApiWebhooksEndpointsReadResponseSchema,
  ApiWebhooksEndpointsReadParamsSchema,
  ApiWebhooksEndpointsUpdateRequestSchema,
  ApiWebhooksEndpointsUpdateResponseSchema,
  ApiWebhooksEndpointsUpdateParamsSchema,
  ApiWebhooksEndpointsPartialUpdateRequestSchema,
  ApiWebhooksEndpointsPartialUpdateResponseSchema,
  ApiWebhooksEndpointsPartialUpdateParamsSchema,
  ApiWebhooksEndpointsDeleteResponseSchema,
  ApiWebhooksEndpointsDeleteParamsSchema,
  ApiWebhooksEndpointsReactivateRequestSchema,
  ApiWebhooksEndpointsReactivateResponseSchema,
  ApiWebhooksEndpointsReactivateParamsSchema,
  ApiWebhooksEndpointsStatisticsResponseSchema,
  ApiWebhooksEndpointsStatisticsParamsSchema,
  ApiWebhooksEndpointsSuspendRequestSchema,
  ApiWebhooksEndpointsSuspendResponseSchema,
  ApiWebhooksEndpointsSuspendParamsSchema,
  ApiWebhooksEndpointsTestRequestSchema,
  ApiWebhooksEndpointsTestResponseSchema,
  ApiWebhooksEndpointsTestParamsSchema,
  ApiWebhooksEventsListResponseSchema,
  ApiWebhooksEventsListParamsSchema,
  ApiWebhooksEventsCreateRequestSchema,
  ApiWebhooksEventsCreateResponseSchema,
  ApiWebhooksEventsReadResponseSchema,
  ApiWebhooksEventsReadParamsSchema,
  ApiWebhooksEventsUpdateRequestSchema,
  ApiWebhooksEventsUpdateResponseSchema,
  ApiWebhooksEventsUpdateParamsSchema,
  ApiWebhooksEventsPartialUpdateRequestSchema,
  ApiWebhooksEventsPartialUpdateResponseSchema,
  ApiWebhooksEventsPartialUpdateParamsSchema,
  ApiWebhooksEventsDeleteResponseSchema,
  ApiWebhooksEventsDeleteParamsSchema,
  ApiWebhooksLogsListResponseSchema,
  ApiWebhooksLogsListParamsSchema,
  ApiWebhooksLogsCreateRequestSchema,
  ApiWebhooksLogsCreateResponseSchema,
  ApiWebhooksLogsReadResponseSchema,
  ApiWebhooksLogsReadParamsSchema,
  ApiWebhooksLogsUpdateRequestSchema,
  ApiWebhooksLogsUpdateResponseSchema,
  ApiWebhooksLogsUpdateParamsSchema,
  ApiWebhooksLogsPartialUpdateRequestSchema,
  ApiWebhooksLogsPartialUpdateResponseSchema,
  ApiWebhooksLogsPartialUpdateParamsSchema,
  ApiWebhooksLogsDeleteResponseSchema,
  ApiWebhooksLogsDeleteParamsSchema
} from '@/core/generated/schemas'

export class ApiApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'api-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'api'
          }
        }
      }
    })
  }

  /**
   * ViewSet for webhook deliveries.
   * ViewSet for webhook deliveries.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesListResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesList({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesList = cache(async (options: {
    params: z.infer<typeof ApiWebhooksDeliveriesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksDeliveriesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesListResponseSchema>>(
      'GET',
      '/api/webhooks/deliveries/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook deliveries.
   * ViewSet for webhook deliveries.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesCreateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesCreate = async (options: {
    body: z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksDeliveriesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesCreateResponseSchema>>(
      'POST',
      '/api/webhooks/deliveries/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook deliveries.
   * ViewSet for webhook deliveries.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesRead({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesRead = cache(async (options: {
    params: z.infer<typeof ApiWebhooksDeliveriesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksDeliveriesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema>>(
      'GET',
      '/api/webhooks/deliveries/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook deliveries.
   * ViewSet for webhook deliveries.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksDeliveriesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksDeliveriesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesUpdateResponseSchema>>(
      'PUT',
      '/api/webhooks/deliveries/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook deliveries.
   * ViewSet for webhook deliveries.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesPartialUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksDeliveriesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksDeliveriesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesPartialUpdateResponseSchema>>(
      'PATCH',
      '/api/webhooks/deliveries/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook deliveries.
   * ViewSet for webhook deliveries.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesDeleteResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesDelete = async (options: {
    params: z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksDeliveriesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesDeleteResponseSchema>>(
      'DELETE',
      '/api/webhooks/deliveries/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesDeleteResponseSchema
      }
    )
  }

  /**
   * Retry failed delivery.
   * Retry failed delivery.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksDeliveriesRetryResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksDeliveriesRetry({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksDeliveriesRetry = async (options: {
    params: z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema>
    body: z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksDeliveriesRetryRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksDeliveriesRetryParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksDeliveriesRetryResponseSchema>>(
      'POST',
      '/api/webhooks/deliveries/{id}/retry/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksDeliveriesRetryResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook endpoints.
   * ViewSet for webhook endpoints.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsListResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsList({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsList = cache(async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsListResponseSchema>>(
      'GET',
      '/api/webhooks/endpoints/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook endpoints.
   * ViewSet for webhook endpoints.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsCreateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsCreate = async (options: {
    body: z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEndpointsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ApiWebhooksEndpointsCreateResponseSchema>>(
      'POST',
      '/api/webhooks/endpoints/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook endpoints.
   * ViewSet for webhook endpoints.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsReadResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsRead({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsRead = cache(async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsReadResponseSchema>>(
      'GET',
      '/api/webhooks/endpoints/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook endpoints.
   * ViewSet for webhook endpoints.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEndpointsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsUpdateResponseSchema>>(
      'PUT',
      '/api/webhooks/endpoints/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook endpoints.
   * ViewSet for webhook endpoints.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsPartialUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEndpointsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsPartialUpdateResponseSchema>>(
      'PATCH',
      '/api/webhooks/endpoints/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook endpoints.
   * ViewSet for webhook endpoints.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsDeleteResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsDelete = async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsDeleteResponseSchema>>(
      'DELETE',
      '/api/webhooks/endpoints/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsDeleteResponseSchema
      }
    )
  }

  /**
   * Reactivate suspended endpoint.
   * Reactivate suspended endpoint.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsReactivateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsReactivate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsReactivate = async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema>
    body: z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEndpointsReactivateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsReactivateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsReactivateResponseSchema>>(
      'POST',
      '/api/webhooks/endpoints/{id}/reactivate/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsReactivateResponseSchema
      }
    )
  }

  /**
   * Get endpoint statistics.
   * Get endpoint statistics.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsStatistics({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsStatistics = cache(async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsStatisticsParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsStatisticsParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema>>(
      'GET',
      '/api/webhooks/endpoints/{id}/statistics/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsStatisticsResponseSchema
      }
    )
  })

  /**
   * Suspend endpoint.
   * Suspend endpoint.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsSuspendResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsSuspend({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsSuspend = async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema>
    body: z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEndpointsSuspendRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsSuspendParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsSuspendResponseSchema>>(
      'POST',
      '/api/webhooks/endpoints/{id}/suspend/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsSuspendResponseSchema
      }
    )
  }

  /**
   * Test webhook endpoint with sample payload.
   * Test webhook endpoint with sample payload.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEndpointsTestResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEndpointsTest({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEndpointsTest = async (options: {
    params: z.infer<typeof ApiWebhooksEndpointsTestParamsSchema>
    body: z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEndpointsTestRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEndpointsTestParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEndpointsTestResponseSchema>>(
      'POST',
      '/api/webhooks/endpoints/{id}/test/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEndpointsTestResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook events.
   * ViewSet for webhook events.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEventsListResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEventsList({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEventsList = cache(async (options: {
    params: z.infer<typeof ApiWebhooksEventsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEventsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEventsListResponseSchema>>(
      'GET',
      '/api/webhooks/events/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEventsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook events.
   * ViewSet for webhook events.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEventsCreateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEventsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEventsCreate = async (options: {
    body: z.infer<typeof ApiWebhooksEventsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEventsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ApiWebhooksEventsCreateResponseSchema>>(
      'POST',
      '/api/webhooks/events/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEventsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook events.
   * ViewSet for webhook events.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEventsReadResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEventsRead({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEventsRead = cache(async (options: {
    params: z.infer<typeof ApiWebhooksEventsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEventsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEventsReadResponseSchema>>(
      'GET',
      '/api/webhooks/events/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEventsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook events.
   * ViewSet for webhook events.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEventsUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEventsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEventsUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksEventsUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEventsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEventsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEventsUpdateResponseSchema>>(
      'PUT',
      '/api/webhooks/events/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEventsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook events.
   * ViewSet for webhook events.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEventsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEventsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEventsPartialUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksEventsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksEventsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEventsPartialUpdateResponseSchema>>(
      'PATCH',
      '/api/webhooks/events/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEventsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook events.
   * ViewSet for webhook events.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksEventsDeleteResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksEventsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksEventsDelete = async (options: {
    params: z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksEventsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksEventsDeleteResponseSchema>>(
      'DELETE',
      '/api/webhooks/events/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksEventsDeleteResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook event logs.
   * ViewSet for webhook event logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksLogsListResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksLogsList({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksLogsList = cache(async (options: {
    params: z.infer<typeof ApiWebhooksLogsListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksLogsListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksLogsListResponseSchema>>(
      'GET',
      '/api/webhooks/logs/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksLogsListResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook event logs.
   * ViewSet for webhook event logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksLogsCreateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksLogsCreate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksLogsCreate = async (options: {
    body: z.infer<typeof ApiWebhooksLogsCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksLogsCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ApiWebhooksLogsCreateResponseSchema>>(
      'POST',
      '/api/webhooks/logs/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksLogsCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook event logs.
   * ViewSet for webhook event logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksLogsReadResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksLogsRead({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksLogsRead = cache(async (options: {
    params: z.infer<typeof ApiWebhooksLogsReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksLogsReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksLogsReadResponseSchema>>(
      'GET',
      '/api/webhooks/logs/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksLogsReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for webhook event logs.
   * ViewSet for webhook event logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksLogsUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksLogsUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksLogsUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksLogsUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksLogsUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksLogsUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksLogsUpdateResponseSchema>>(
      'PUT',
      '/api/webhooks/logs/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksLogsUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook event logs.
   * ViewSet for webhook event logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksLogsPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksLogsPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksLogsPartialUpdate = async (options: {
    params: z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema>
    body: z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ApiWebhooksLogsPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ApiWebhooksLogsPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksLogsPartialUpdateResponseSchema>>(
      'PATCH',
      '/api/webhooks/logs/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksLogsPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for webhook event logs.
   * ViewSet for webhook event logs.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ApiWebhooksLogsDeleteResponseSchema>>>
   * @example
   * const result = await client.apiWebhooksLogsDelete({
   *   config: { timeout: 5000 }
   * })
   */
  apiWebhooksLogsDelete = async (options: {
    params: z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ApiWebhooksLogsDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ApiWebhooksLogsDeleteResponseSchema>>(
      'DELETE',
      '/api/webhooks/logs/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ApiWebhooksLogsDeleteResponseSchema
      }
    )
  }
}