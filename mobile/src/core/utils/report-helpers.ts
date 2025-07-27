import { ReportTemplate } from "../types"

export const formatReportData = (data: any[], columns: ReportTemplate["columns"]) => {
  return data.map((row) => {
    const formattedRow: Record<string, any> = {}

    columns.forEach((column) => {
      const value = row[column.field]

      switch (column.type) {
        case "currency":
          formattedRow[column.field] = formatCurrency(value)
          break
        case "percentage":
          formattedRow[column.field] = formatPercentage(value)
          break
        case "date":
          formattedRow[column.field] = formatDate(value)
          break
        case "number":
          formattedRow[column.field] = formatNumber(value)
          break
        default:
          formattedRow[column.field] = value
      }
    })

    return formattedRow
  })
}

export const formatCurrency = (value: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value || 0)
}

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
  }).format((value || 0) / 100)
}

export const formatDate = (value: string | Date) => {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  return date.toLocaleDateString()
}

export const formatNumber = (value: number, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value || 0)
}

export const exportToCSV = async (data: any[]) => {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(","),
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header]
                    if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value
                })
                .join(","),
        ),
    ].join("\n")

    return csvContent
}

export const generateChartData = (data: any[], chartConfig: ReportTemplate["chart_config"]) => {
  if (!chartConfig.x_axis || !chartConfig.y_axis) return null

  const labels = [...new Set(data.map((item) => item[chartConfig.x_axis!]))]
  const datasets =
    chartConfig.series?.map((series, index) => ({
      label: series,
      data: labels.map((label) => {
        const item = data.find((d) => d[chartConfig.x_axis!] === label)
        return item ? item[series] : 0
      }),
      backgroundColor: chartConfig.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`,
      borderColor: chartConfig.colors?.[index] || `hsl(${index * 60}, 70%, 40%)`,
    })) || []

  return { labels, datasets }
}

export const validateReportTemplate = (template: Partial<ReportTemplate>) => {
  const errors: string[] = []

  if (!template.name?.trim()) {
    errors.push("Report name is required")
  }

  if (!template.code?.trim()) {
    errors.push("Report code is required")
  }

  if (!template.category) {
    errors.push("Report category is required")
  }

  if (!template.query_config?.model) {
    errors.push("Query model is required")
  }

  if (!template.columns?.length) {
    errors.push("At least one column is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const buildReportQuery = (template: ReportTemplate, parameters: Record<string, any>) => {
  const { query_config } = template
  const filters = { ...query_config.default_filters }

  Object.entries(parameters).forEach(([key, value]) => {
    const paramConfig = query_config.parameters[key]
    if (paramConfig && value !== undefined && value !== "") {
      filters[key] = value
    }
  })

  return {
    model: query_config.model,
    fields: query_config.fields,
    filters,
  }
}
