"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native"
import { ArrowLeft, Download, Share2, RefreshCw } from "lucide-react-native"
import type { ReportResponse, ReportTemplate } from "@/core/types"
import { useExecuteReportTemplateMutation } from "@/core/services/api"
import { Input } from "@/components/ui/input"

const { width: screenWidth } = Dimensions.get("window")

interface ReportDetailScreenProps {
  template: ReportTemplate
  onBack: () => void
}

const ITEM_HEIGHT = 50
const HEADER_HEIGHT = 50
const RENDER_BATCH_SIZE = 50
const WINDOW_SIZE = 21
const INITIAL_RENDER_COUNT = 20

const TableHeader = React.memo(({ columns }: { columns: string[] }) => (
  <View style={styles.tableHeader}>
    {columns.map((column) => (
      <View key={column} style={styles.headerCell}>
        <Text style={styles.headerText} numberOfLines={2}>
          {column}
        </Text>
      </View>
    ))}
  </View>
))

const TableRow = React.memo(
  ({
    item,
    columns,
    index,
  }: {
    item: any
    columns: string[]
    index: number
  }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      {columns.map((column) => (
        <View key={`${index}-${column}`} style={styles.tableCell}>
          <Text style={styles.cellText} numberOfLines={3}>
            {item[column] !== null && item[column] !== undefined ? String(item[column]) : "-"}
          </Text>
        </View>
      ))}
    </View>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.columns.length === nextProps.columns.length &&
      JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item)
    )
  },
)

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const ReportDetailScreen = ({ template, onBack }: ReportDetailScreenProps) => {
  const [executeReport, { isLoading }] = useExecuteReportTemplateMutation()
  const [result, setResult] = useState<ReportResponse | undefined>()
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const flatListRef = useRef<FlatList>(null)
  const parametersRef = useRef<Record<string, any>>({})

  const debouncedParameters = useDebounce(parameters, 500)

  const columns = useMemo(() => {
    if (!result?.data || result.data.length === 0) return []

    const firstRow = result.data[0]
    return Object.keys(firstRow)
  }, [result?.data]) 

  const paginatedData = useMemo(() => {
    if (!result?.data) return []


    if (result.data.length > 1000) {
      const pageSize = 100
      const startIndex = currentPage * pageSize
      const endIndex = Math.min(startIndex + pageSize, result.data.length)
      return result.data.slice(0, endIndex) 
    }

    return result.data
  }, [result?.data, currentPage])

  const handleParameterChange = useCallback((paramName: string, value: string) => {
    setParameters((prev) => {
      const newParams = { ...prev, [paramName]: value }
      parametersRef.current = newParams
      return newParams
    })
  }, [])

  const defaultParameters = useMemo(() => {
    if (!template.parameters?.length) return {}

    const defaultParams: Record<string, any> = {}
    template.parameters.forEach((param) => {
      if (param.default_value) {
        defaultParams[param.name] = param.default_value
      }
    })
    return defaultParams
  }, [template.parameters])

  const executeReportHandler = useCallback(
    async (params?: Record<string, any>) => {
      try {
        const execParams = params || parametersRef.current

        const execResult = await executeReport({
          id: template.id,
          parameters: execParams,
          format: "json",
        }).unwrap()

        setResult(execResult)
        setCurrentPage(0)

        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false })
        }
      } catch (error: any) {
        console.error("Report execution error:", error)
        Alert.alert("خطأ في تنفيذ التقرير", error?.data?.error || "حدث خطأ أثناء تنفيذ التقرير")
      } finally {
        setIsInitialLoad(false)
        setIsLoadingMore(false)
      }
    },
    [executeReport, template.id],
  )

  useEffect(() => {
    if (Object.keys(defaultParameters).length > 0) {
      setParameters(defaultParameters)
      parametersRef.current = defaultParameters
    }
  }, [defaultParameters])

 
  useEffect(() => {
    if (!isInitialLoad && Object.keys(debouncedParameters).length > 0) {
      executeReportHandler(debouncedParameters)
    }
  }, [debouncedParameters, executeReportHandler, isInitialLoad])

  useEffect(() => {
    const timer = setTimeout(() => {
      executeReportHandler(defaultParameters)
    }, 100) 

    return () => clearTimeout(timer)
  }, [defaultParameters, executeReportHandler])

  const renderTableRow = useCallback(
    ({ item, index }: { item: any; index: number }) => <TableRow item={item} columns={columns} index={index} />,
    [columns],
  )

  const keyExtractor = useCallback((item: any, index: number) => {
    return item.id ? `row-${item.id}` : `row-${index}`
  }, [])

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  )

  const handleLoadMore = useCallback(() => {
    if (result?.data && result.data.length > 1000 && !isLoadingMore) {
      const totalPages = Math.ceil(result.data.length / 100)
      if (currentPage < totalPages - 1) {
        setIsLoadingMore(true)
        setCurrentPage((prev) => prev + 1)
      }
    }
  }, [result?.data, currentPage, isLoadingMore])

  const renderDataTable = useCallback(() => {
    if (!result || !paginatedData || paginatedData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لا توجد بيانات لعرضها</Text>
        </View>
      )
    }

    const tableWidth = Math.max(screenWidth - 32, columns.length * 120)

    return (
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: tableWidth }}>
            <TableHeader columns={columns} />
            <FlatList
              ref={flatListRef}
              data={paginatedData}
              renderItem={renderTableRow}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={RENDER_BATCH_SIZE}
              windowSize={WINDOW_SIZE}
              initialNumToRender={INITIAL_RENDER_COUNT}
              updateCellsBatchingPeriod={50}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadMoreText}>جاري تحميل المزيد...</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </ScrollView>
      </View>
    )
  }, [result, paginatedData, columns, renderTableRow, keyExtractor, getItemLayout, handleLoadMore, isLoadingMore])

  const handleDownload = useCallback(() => {
    if (!result) {
      Alert.alert("خطأ", "لا توجد بيانات للتحميل")
      return
    }
    Alert.alert("تحميل التقرير", "سيتم تنزيل التقرير قريباً")
  }, [result])

  const handleShare = useCallback(() => {
    Alert.alert("مشاركة التقرير", "سيتم مشاركة التقرير قريباً")
  }, [])

  const handleRefresh = useCallback(() => {
    executeReportHandler()
  }, [executeReportHandler])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {template.name}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleRefresh} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" color="#007AFF" /> : <RefreshCw size={20} color="#8b5cf6" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share2 size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {template.parameters?.length > 0 && (
          <View style={styles.parametersContainer}>
            <Text style={styles.parametersTitle}>المعاملات المطلوبة</Text>
            {template.parameters.map((param) => (
              <View key={param.name} style={styles.parameterItem}>
                <Text style={styles.parameterLabel}>
                  {param.label} {param.required && <Text style={styles.required}>*</Text>}
                </Text>
                <Input
                  style={styles.parameterInput}
                  placeholder={`أدخل ${param.label}`}
                  placeholderTextColor="#888"
                  value={parameters[param.name] || ""}
                  onChangeText={(text) => handleParameterChange(param.name, text)}
                />
                {param.default_value && (
                  <Text style={styles.defaultValue}>القيمة الافتراضية: {param.default_value}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {isInitialLoad && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>جاري تحميل التقرير...</Text>
          </View>
        )}

        {!isInitialLoad && result && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>نتائج التقرير</Text>
              <Text style={styles.resultsCount}>{result.data?.length || 0} سجل</Text>
            </View>
            {renderDataTable()}
          </View>
        )}
      </ScrollView>

      {/* {result && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.downloadButton, !result && styles.disabledButton]}
            onPress={handleDownload}
            disabled={!result}
          >
            <Download size={20} color={result ? "#007AFF" : "#9CA3AF"} />
            <Text style={[styles.downloadText, !result && styles.disabledText]}>تحميل التقرير</Text>
          </TouchableOpacity>
        </View>
      )} */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
    color: "#1F2937",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  parametersContainer: {
    backgroundColor: "#F9FAFB",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  parametersTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  parameterItem: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  parameterInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  defaultValue: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  resultsContainer: {
    margin: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  resultsCount: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tableContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
    height: HEADER_HEIGHT,
  },
  headerCell: {
    padding: 16,
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    justifyContent: "center",
  },
  headerText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#475569",
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    height: ITEM_HEIGHT,
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#FAFBFC",
  },
  tableCell: {
    padding: 16,
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 14,
    color: "#334155",
    textAlign: "left",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loadMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F9FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
  },
  downloadText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    marginLeft: 8,
  },
  disabledText: {
    color: "#9CA3AF",
  },
})
