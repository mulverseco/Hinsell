"use client"

import { useMemo } from "react"
import {
  useGetReportTemplatesQuery,
  useGetReportCategoriesQuery,
} from "../services/api"
import type { ReportFilters } from "../types"

export const useReporting = () => {
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetReportCategoriesQuery()

  return {
    categories: categoriesData || [],
    isLoading: categoriesLoading,
    error: categoriesError,
  }
}

export const useReportTemplates = (filters: ReportFilters = {}) => {
  const { data, isLoading, error, refetch } = useGetReportTemplatesQuery(filters)

  const templates = useMemo(() => data?.results || [], [data])

  const templatesByCategory = useMemo(() => {
    return templates.reduce(
      (acc: { [x: string]: any[] }, template: { category: { id: any } }) => {
        const categoryId = template.category.id
        if (!acc[categoryId]) {
          acc[categoryId] = []
        }
        acc[categoryId].push(template)
        return acc
      },
      {} as Record<string, typeof templates>,
    )
  }, [templates])

  return {
    templates,
    templatesByCategory,
    totalCount: data?.count || 0,
    hasNext: !!data?.next,
    hasPrevious: !!data?.previous,
    isLoading,
    error,
    refetch,
  }
}

export const useReportBuilder = () => {
  // Helper functions for building reports
  const validateParameters = (parameters: Record<string, any>, template: any) => {
    const errors: Record<string, string> = {}

    template.parameters?.forEach((param: any) => {
      if (param.required && !parameters[param.name]) {
        errors[param.name] = `${param.label} is required`
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  const formatParameterValue = (value: any, type: string) => {
    switch (type) {
      case "date":
        return value instanceof Date ? value.toISOString().split("T")[0] : value
      case "number":
        return Number(value)
      case "boolean":
        return Boolean(value)
      default:
        return String(value)
    }
  }

  const buildQueryParams = (parameters: Record<string, any>, template: any) => {
    const queryParams: Record<string, any> = {}

    template.parameters?.forEach((param: any) => {
      if (parameters[param.name] !== undefined) {
        queryParams[param.name] = formatParameterValue(parameters[param.name], param.type)
      }
    })

    return queryParams
  }

  return {
    validateParameters,
    formatParameterValue,
    buildQueryParams,
  }
}
