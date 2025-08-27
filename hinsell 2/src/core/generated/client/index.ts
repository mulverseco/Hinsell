import 'server-only'
import { BaseApiClient } from './base'
import { defaultMiddleware, createMiddlewareStack } from './middleware'
import { AccountTypesApiClient } from './accountTypes'
import { AccountingPeriodsApiClient } from './accountingPeriods'
import { AccountsApiClient } from './accounts'
import { ApiApiClient } from './api'
import { AuditLogsApiClient } from './auditLogs'
import { AuthApiClient } from './auth'
import { BranchesApiClient } from './branches'
import { BudgetsApiClient } from './budgets'
import { CampaignsApiClient } from './campaigns'
import { CompaniesApiClient } from './companies'
import { CostCentersApiClient } from './costCenters'
import { CouponsApiClient } from './coupons'
import { CurrenciesApiClient } from './currencies'
import { CurrencyHistoryApiClient } from './currencyHistory'
import { InventoryBalancesApiClient } from './inventoryBalances'
import { ItemBarcodesApiClient } from './itemBarcodes'
import { ItemGroupsApiClient } from './itemGroups'
import { ItemUnitsApiClient } from './itemUnits'
import { ItemsApiClient } from './items'
import { KeyboardShortcutsApiClient } from './keyboardShortcuts'
import { LicenseTypesApiClient } from './licenseTypes'
import { LicensesApiClient } from './licenses'
import { LogsApiClient } from './logs'
import { MessagesApiClient } from './messages'
import { NotesApiClient } from './notes'
import { NotificationsApiClient } from './notifications'
import { OffersApiClient } from './offers'
import { OpeningBalancesApiClient } from './openingBalances'
import { ProfilesApiClient } from './profiles'
import { ReportsApiClient } from './reports'
import { StoreGroupsApiClient } from './storeGroups'
import { SubscribersApiClient } from './subscribers'
import { SystemSettingsApiClient } from './systemSettings'
import { TemplatesApiClient } from './templates'
import { UserCouponsApiClient } from './userCoupons'
import { UsersApiClient } from './users'

/**
 * Enhanced API client with all endpoint groups
 * Features: Request deduplication, caching, middleware, metrics
 * Auto-generated from OpenAPI schema
 */
export class ApiClient extends BaseApiClient {
  public readonly accountTypes: AccountTypesApiClient
  public readonly accountingPeriods: AccountingPeriodsApiClient
  public readonly accounts: AccountsApiClient
  public readonly api: ApiApiClient
  public readonly auditLogs: AuditLogsApiClient
  public readonly auth: AuthApiClient
  public readonly branches: BranchesApiClient
  public readonly budgets: BudgetsApiClient
  public readonly campaigns: CampaignsApiClient
  public readonly companies: CompaniesApiClient
  public readonly costCenters: CostCentersApiClient
  public readonly coupons: CouponsApiClient
  public readonly currencies: CurrenciesApiClient
  public readonly currencyHistory: CurrencyHistoryApiClient
  public readonly inventoryBalances: InventoryBalancesApiClient
  public readonly itemBarcodes: ItemBarcodesApiClient
  public readonly itemGroups: ItemGroupsApiClient
  public readonly itemUnits: ItemUnitsApiClient
  public readonly items: ItemsApiClient
  public readonly keyboardShortcuts: KeyboardShortcutsApiClient
  public readonly licenseTypes: LicenseTypesApiClient
  public readonly licenses: LicensesApiClient
  public readonly logs: LogsApiClient
  public readonly messages: MessagesApiClient
  public readonly notes: NotesApiClient
  public readonly notifications: NotificationsApiClient
  public readonly offers: OffersApiClient
  public readonly openingBalances: OpeningBalancesApiClient
  public readonly profiles: ProfilesApiClient
  public readonly reports: ReportsApiClient
  public readonly storeGroups: StoreGroupsApiClient
  public readonly subscribers: SubscribersApiClient
  public readonly systemSettings: SystemSettingsApiClient
  public readonly templates: TemplatesApiClient
  public readonly userCoupons: UserCouponsApiClient
  public readonly users: UsersApiClient

  constructor() {
    super()
    
    // Initialize endpoint clients
    this.accountTypes = new AccountTypesApiClient()
    this.accountingPeriods = new AccountingPeriodsApiClient()
    this.accounts = new AccountsApiClient()
    this.api = new ApiApiClient()
    this.auditLogs = new AuditLogsApiClient()
    this.auth = new AuthApiClient()
    this.branches = new BranchesApiClient()
    this.budgets = new BudgetsApiClient()
    this.campaigns = new CampaignsApiClient()
    this.companies = new CompaniesApiClient()
    this.costCenters = new CostCentersApiClient()
    this.coupons = new CouponsApiClient()
    this.currencies = new CurrenciesApiClient()
    this.currencyHistory = new CurrencyHistoryApiClient()
    this.inventoryBalances = new InventoryBalancesApiClient()
    this.itemBarcodes = new ItemBarcodesApiClient()
    this.itemGroups = new ItemGroupsApiClient()
    this.itemUnits = new ItemUnitsApiClient()
    this.items = new ItemsApiClient()
    this.keyboardShortcuts = new KeyboardShortcutsApiClient()
    this.licenseTypes = new LicenseTypesApiClient()
    this.licenses = new LicensesApiClient()
    this.logs = new LogsApiClient()
    this.messages = new MessagesApiClient()
    this.notes = new NotesApiClient()
    this.notifications = new NotificationsApiClient()
    this.offers = new OffersApiClient()
    this.openingBalances = new OpeningBalancesApiClient()
    this.profiles = new ProfilesApiClient()
    this.reports = new ReportsApiClient()
    this.storeGroups = new StoreGroupsApiClient()
    this.subscribers = new SubscribersApiClient()
    this.systemSettings = new SystemSettingsApiClient()
    this.templates = new TemplatesApiClient()
    this.userCoupons = new UserCouponsApiClient()
    this.users = new UsersApiClient()
    
    // Add global middleware
    createMiddlewareStack().forEach(middleware => {
      this.addMiddleware(middleware)
    })
  }

  // Utility methods
  async healthCheck(): Promise<{ status: 'ok' | 'error', timestamp: number, version?: string }> {
    try {
      const response = await this.get('/health')
      return {
        status: 'ok',
        timestamp: Date.now(),
        version: response.headers.get('x-api-version') || undefined
      }
    } catch {
      return {
        status: 'error',
        timestamp: Date.now()
      }
    }
  }

  // Get client metrics
  getClientMetrics() {
    return {
      requests: this.getMetrics(),
      cacheSize: this.getCacheSize(),
      uptime: Date.now() - this.startTime
    }
  }

  private startTime = Date.now()
  
  private getCacheSize(): number {
    // This would return the size of the request cache
    return 0
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual clients for tree-shaking
export { AccountTypesApiClient } from './accountTypes'
export { AccountingPeriodsApiClient } from './accountingPeriods'
export { AccountsApiClient } from './accounts'
export { ApiApiClient } from './api'
export { AuditLogsApiClient } from './auditLogs'
export { AuthApiClient } from './auth'
export { BranchesApiClient } from './branches'
export { BudgetsApiClient } from './budgets'
export { CampaignsApiClient } from './campaigns'
export { CompaniesApiClient } from './companies'
export { CostCentersApiClient } from './costCenters'
export { CouponsApiClient } from './coupons'
export { CurrenciesApiClient } from './currencies'
export { CurrencyHistoryApiClient } from './currencyHistory'
export { InventoryBalancesApiClient } from './inventoryBalances'
export { ItemBarcodesApiClient } from './itemBarcodes'
export { ItemGroupsApiClient } from './itemGroups'
export { ItemUnitsApiClient } from './itemUnits'
export { ItemsApiClient } from './items'
export { KeyboardShortcutsApiClient } from './keyboardShortcuts'
export { LicenseTypesApiClient } from './licenseTypes'
export { LicensesApiClient } from './licenses'
export { LogsApiClient } from './logs'
export { MessagesApiClient } from './messages'
export { NotesApiClient } from './notes'
export { NotificationsApiClient } from './notifications'
export { OffersApiClient } from './offers'
export { OpeningBalancesApiClient } from './openingBalances'
export { ProfilesApiClient } from './profiles'
export { ReportsApiClient } from './reports'
export { StoreGroupsApiClient } from './storeGroups'
export { SubscribersApiClient } from './subscribers'
export { SystemSettingsApiClient } from './systemSettings'
export { TemplatesApiClient } from './templates'
export { UserCouponsApiClient } from './userCoupons'
export { UsersApiClient } from './users'

// Export types and utilities
export type { ClientResponse, RequestConfiguration, ApiError, ValidationError, TimeoutError, NetworkError } from './base'
export type { RequestMiddleware } from './base'
