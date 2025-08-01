import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  InventoryBalancesListResponseSchema,
  InventoryBalancesListParamsSchema,
  InventoryBalancesCreateRequestSchema,
  InventoryBalancesCreateResponseSchema,
  InventoryBalancesReadResponseSchema,
  InventoryBalancesReadParamsSchema,
  InventoryBalancesUpdateRequestSchema,
  InventoryBalancesUpdateResponseSchema,
  InventoryBalancesUpdateParamsSchema,
  InventoryBalancesPartialUpdateRequestSchema,
  InventoryBalancesPartialUpdateResponseSchema,
  InventoryBalancesPartialUpdateParamsSchema,
  InventoryBalancesDeleteResponseSchema,
  InventoryBalancesDeleteParamsSchema
} from '@/core/generated/schemas'

export class InventoryBalancesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'inventoryBalances-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'inventoryBalances'
          }
        }
      }
    })
  }

  /**
   * ViewSet for InventoryBalance model.
   * ViewSet for InventoryBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof InventoryBalancesListResponseSchema>>>
   * @example
   * const result = await client.inventoryBalancesList({
   *   config: { timeout: 5000 }
   * })
   */
  inventoryBalancesList = cache(async (options: {
    params: z.infer<typeof InventoryBalancesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await InventoryBalancesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof InventoryBalancesListResponseSchema>>(
      'GET',
      '/inventory-balances/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: InventoryBalancesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for InventoryBalance model.
   * ViewSet for InventoryBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof InventoryBalancesCreateResponseSchema>>>
   * @example
   * const result = await client.inventoryBalancesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  inventoryBalancesCreate = async (options: {
    body: z.infer<typeof InventoryBalancesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await InventoryBalancesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof InventoryBalancesCreateResponseSchema>>(
      'POST',
      '/inventory-balances/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: InventoryBalancesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for InventoryBalance model.
   * ViewSet for InventoryBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof InventoryBalancesReadResponseSchema>>>
   * @example
   * const result = await client.inventoryBalancesRead({
   *   config: { timeout: 5000 }
   * })
   */
  inventoryBalancesRead = cache(async (options: {
    params: z.infer<typeof InventoryBalancesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await InventoryBalancesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof InventoryBalancesReadResponseSchema>>(
      'GET',
      '/inventory-balances/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: InventoryBalancesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for InventoryBalance model.
   * ViewSet for InventoryBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof InventoryBalancesUpdateResponseSchema>>>
   * @example
   * const result = await client.inventoryBalancesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  inventoryBalancesUpdate = async (options: {
    params: z.infer<typeof InventoryBalancesUpdateParamsSchema>
    body: z.infer<typeof InventoryBalancesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await InventoryBalancesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await InventoryBalancesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof InventoryBalancesUpdateResponseSchema>>(
      'PUT',
      '/inventory-balances/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: InventoryBalancesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for InventoryBalance model.
   * ViewSet for InventoryBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof InventoryBalancesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.inventoryBalancesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  inventoryBalancesPartialUpdate = async (options: {
    params: z.infer<typeof InventoryBalancesPartialUpdateParamsSchema>
    body: z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await InventoryBalancesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await InventoryBalancesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof InventoryBalancesPartialUpdateResponseSchema>>(
      'PATCH',
      '/inventory-balances/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: InventoryBalancesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for InventoryBalance model.
   * ViewSet for InventoryBalance model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof InventoryBalancesDeleteResponseSchema>>>
   * @example
   * const result = await client.inventoryBalancesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  inventoryBalancesDelete = async (options: {
    params: z.infer<typeof InventoryBalancesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await InventoryBalancesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof InventoryBalancesDeleteResponseSchema>>(
      'DELETE',
      '/inventory-balances/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: InventoryBalancesDeleteResponseSchema
      }
    )
  }
}