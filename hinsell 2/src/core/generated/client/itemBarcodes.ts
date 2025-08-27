import 'server-only'
import { z } from 'zod'
import { cache } from 'react'
import { BaseApiClient } from './base'
import type { ClientResponse, RequestConfiguration } from './base'
import { defaultMiddleware } from './middleware'
import {
  ItemBarcodesListResponseSchema,
  ItemBarcodesListParamsSchema,
  ItemBarcodesCreateRequestSchema,
  ItemBarcodesCreateResponseSchema,
  ItemBarcodesReadResponseSchema,
  ItemBarcodesReadParamsSchema,
  ItemBarcodesUpdateRequestSchema,
  ItemBarcodesUpdateResponseSchema,
  ItemBarcodesUpdateParamsSchema,
  ItemBarcodesPartialUpdateRequestSchema,
  ItemBarcodesPartialUpdateResponseSchema,
  ItemBarcodesPartialUpdateParamsSchema,
  ItemBarcodesDeleteResponseSchema,
  ItemBarcodesDeleteParamsSchema
} from '@/core/generated/schemas'

export class ItemBarcodesApiClient extends BaseApiClient {
  constructor() {
    super()
    
    // Add tag-specific middleware
    this.addMiddleware({
      name: 'itemBarcodes-context',
      onRequest: async (config) => {
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-API-Context': 'itemBarcodes'
          }
        }
      }
    })
  }

  /**
   * ViewSet for ItemBarcode model.
   * ViewSet for ItemBarcode model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemBarcodesListResponseSchema>>>
   * @example
   * const result = await client.itemBarcodesList({
   *   config: { timeout: 5000 }
   * })
   */
  itemBarcodesList = cache(async (options: {
    params: z.infer<typeof ItemBarcodesListParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemBarcodesListParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemBarcodesListResponseSchema>>(
      'GET',
      '/item-barcodes/',
      {
queryParams: validatedParams.query,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemBarcodesListResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemBarcode model.
   * ViewSet for ItemBarcode model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemBarcodesCreateResponseSchema>>>
   * @example
   * const result = await client.itemBarcodesCreate({
   *   config: { timeout: 5000 }
   * })
   */
  itemBarcodesCreate = async (options: {
    body: z.infer<typeof ItemBarcodesCreateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemBarcodesCreateRequestSchema.parseAsync(options.body)

    return this.request<z.infer<typeof ItemBarcodesCreateResponseSchema>>(
      'POST',
      '/item-barcodes/',
      {
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemBarcodesCreateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemBarcode model.
   * ViewSet for ItemBarcode model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemBarcodesReadResponseSchema>>>
   * @example
   * const result = await client.itemBarcodesRead({
   *   config: { timeout: 5000 }
   * })
   */
  itemBarcodesRead = cache(async (options: {
    params: z.infer<typeof ItemBarcodesReadParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemBarcodesReadParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemBarcodesReadResponseSchema>>(
      'GET',
      '/item-barcodes/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemBarcodesReadResponseSchema
      }
    )
  })

  /**
   * ViewSet for ItemBarcode model.
   * ViewSet for ItemBarcode model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemBarcodesUpdateResponseSchema>>>
   * @example
   * const result = await client.itemBarcodesUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemBarcodesUpdate = async (options: {
    params: z.infer<typeof ItemBarcodesUpdateParamsSchema>
    body: z.infer<typeof ItemBarcodesUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemBarcodesUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemBarcodesUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemBarcodesUpdateResponseSchema>>(
      'PUT',
      '/item-barcodes/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemBarcodesUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemBarcode model.
   * ViewSet for ItemBarcode model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemBarcodesPartialUpdateResponseSchema>>>
   * @example
   * const result = await client.itemBarcodesPartialUpdate({
   *   config: { timeout: 5000 }
   * })
   */
  itemBarcodesPartialUpdate = async (options: {
    params: z.infer<typeof ItemBarcodesPartialUpdateParamsSchema>
    body: z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>
    config?: RequestConfiguration
  }) => {
    // Validate request body
    const validatedBody = await ItemBarcodesPartialUpdateRequestSchema.parseAsync(options.body)
// Validate and extract parameters
const validatedParams = await ItemBarcodesPartialUpdateParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemBarcodesPartialUpdateResponseSchema>>(
      'PATCH',
      '/item-barcodes/{id}/',
      {
        pathParams: validatedParams.path,
body: validatedBody,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemBarcodesPartialUpdateResponseSchema
      }
    )
  }

  /**
   * ViewSet for ItemBarcode model.
   * ViewSet for ItemBarcode model.
   * @param options - Request options
   * @returns Promise<ClientResponse<z.infer<typeof ItemBarcodesDeleteResponseSchema>>>
   * @example
   * const result = await client.itemBarcodesDelete({
   *   config: { timeout: 5000 }
   * })
   */
  itemBarcodesDelete = async (options: {
    params: z.infer<typeof ItemBarcodesDeleteParamsSchema>
    config?: RequestConfiguration
  }) => {
// Validate and extract parameters
const validatedParams = await ItemBarcodesDeleteParamsSchema.parseAsync(options.params)

    return this.request<z.infer<typeof ItemBarcodesDeleteResponseSchema>>(
      'DELETE',
      '/item-barcodes/{id}/',
      {
        pathParams: validatedParams.path,
config: { ...options?.config, middleware: [...defaultMiddleware, ...(options?.config?.middleware || [])] },
responseSchema: ItemBarcodesDeleteResponseSchema
      }
    )
  }
}