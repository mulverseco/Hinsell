import { z } from "zod"

// Generated schemas from OpenAPI specification
// Base schemas, request schemas, and response schemas

export const AccountTypeSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  category: z.enum(["asset", "liability", "equity", "revenue", "expense", "cogs"]),
  normal_balance: z.enum(["debit", "credit"]),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type AccountType = z.infer<typeof AccountTypeSchema>
export const AccountingPeriodSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50"),
  start_date: z.string(),
  end_date: z.string(),
  fiscal_year: z.number().int().min(-2147483648, "Minimum value is -2147483648").max(2147483647, "Maximum value is 2147483647"),
  is_closed: z.boolean().optional(),
  closed_by: z.string().uuid("Invalid UUID format"),
  closed_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type AccountingPeriod = z.infer<typeof AccountingPeriodSchema>
export const AccountSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(250, "Maximum length is 250"),
  parent: z.string().uuid("Invalid UUID format"),
  account_type: z.string().uuid("Invalid UUID format"),
  account_nature: z.enum(["customer", "supplier", "bank", "cash", "inventory", "fixed_asset", "other"]).optional(),
  is_header: z.boolean().optional(),
  is_hidden: z.boolean().optional(),
  is_system: z.boolean().optional(),
  currency: z.string().uuid("Invalid UUID format"),
  is_taxable: z.boolean().optional(),
  tax_code: z.string().max(20, "Maximum length is 20").optional(),
  commission_ratio: z.string().optional(),
  credit_limit: z.string().optional(),
  debit_limit: z.string().optional(),
  email: z.string().max(254, "Maximum length is 254").email("Invalid email format").optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  tax_registration_number: z.string().max(50, "Maximum length is 50").optional(),
  stop_sales: z.boolean().optional(),
  current_balance: z.string().optional(),
  budget_amount: z.string().optional(),
  enable_notifications: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Account = z.infer<typeof AccountSchema>
export const WebhookDeliverySchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  endpoint: z.string().uuid("Invalid UUID format"),
  endpoint_name: z.string().min(1, "Minimum length is 1").optional(),
  endpoint_url: z.string().min(1, "Minimum length is 1").optional(),
  event_type: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  event_id: z.string().uuid("Invalid UUID format"),
  payload: z.record(z.any()).optional(),
  status: z.enum(["pending", "sending", "success", "failed", "cancelled"]).optional(),
  request_headers: z.record(z.any()).optional(),
  request_body: z.string().min(1, "Minimum length is 1").optional(),
  response_status_code: z.number().int().optional(),
  response_headers: z.record(z.any()).optional(),
  response_body: z.string().min(1, "Minimum length is 1").optional(),
  sent_at: z.string().optional(),
  completed_at: z.string().optional(),
  duration_ms: z.number().int().optional(),
  attempt_number: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  max_attempts: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  next_retry_at: z.string().optional(),
  error_message: z.string().min(1, "Minimum length is 1").optional(),
  error_code: z.string().min(1, "Minimum length is 1").optional(),
  can_retry: z.string().optional(),
  is_successful: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>
export const WebhookEventSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  event_type: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  category: z.enum(["user", "inventory", "transaction", "payment", "medical", "system", "custom"]),
  description: z.string().optional(),
  payload_schema: z.record(z.any()).optional(),
  is_system_event: z.boolean().optional(),
  requires_permission: z.string().max(100, "Maximum length is 100").optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type WebhookEvent = z.infer<typeof WebhookEventSchema>
export const WebhookEndpointSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  url: z.string().min(1, "Minimum length is 1").max(500, "Maximum length is 500").url("Invalid URL format"),
  status: z.enum(["active", "inactive", "suspended", "failed"]).optional(),
  subscribed_events: z.array(WebhookEventSchema).optional(),
  subscribed_event_ids: z.array(z.string().uuid("Invalid UUID format")),
  http_method: z.enum(["POST", "PUT", "PATCH"]).optional(),
  content_type: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50").optional(),
  custom_headers: z.record(z.any()).optional(),
  max_retries: z.number().int().min(0, "Minimum value is 0").max(10, "Maximum value is 10").optional(),
  retry_delay: z.number().int().min(1, "Minimum value is 1").max(3600, "Maximum value is 3600").optional(),
  timeout: z.number().int().min(5, "Minimum value is 5").max(300, "Maximum value is 300").optional(),
  filter_conditions: z.record(z.any()).optional(),
  total_deliveries: z.number().int().optional(),
  successful_deliveries: z.number().int().optional(),
  failed_deliveries: z.number().int().optional(),
  consecutive_failures: z.number().int().optional(),
  last_delivery_at: z.string().optional(),
  last_success_at: z.string().optional(),
  failure_threshold: z.number().int().min(1, "Minimum value is 1").max(100, "Maximum value is 100").optional(),
  suspended_until: z.string().optional(),
  success_rate: z.string().optional(),
  is_healthy: z.string().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>
export const WebhookEventLogSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  event_id: z.string().uuid("Invalid UUID format").optional(),
  event_type: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  source_content_type: z.number().int().optional(),
  source_object_id: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  source_object_name: z.string().optional(),
  event_data: z.record(z.any()),
  endpoints_notified: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  successful_deliveries: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  failed_deliveries: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  success_rate: z.string().optional(),
  is_processed: z.boolean().optional(),
  processed_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type WebhookEventLog = z.infer<typeof WebhookEventLogSchema>
export const AuditLogSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format").optional(),
  branch_name: z.string().min(1, "Minimum length is 1").optional(),
  user: z.string().uuid("Invalid UUID format").optional(),
  user_full_name: z.string().min(1, "Minimum length is 1").optional(),
  action_type: z.enum(["login", "logout", "login_failed", "password_change", "profile_update", "permission_change", "data_access", "data_modification", "system_access", "account_locked", "account_unlocked", "loyalty_points_added", "loyalty_points_redeemed", "terms_accepted", "consent_updated", "profile_deletion", "push_token_updated", "license_activated"]).optional(),
  username: z.string().max(100, "Maximum length is 100").optional(),
  ip_address: z.string().min(1, "Minimum length is 1").optional(),
  user_agent: z.string().optional(),
  device_type: z.string().max(50, "Maximum length is 50").optional(),
  login_status: z.enum(["success", "failed", "blocked"]).optional(),
  session_id: z.string().max(100, "Maximum length is 100").optional(),
  country: z.string().max(100, "Maximum length is 100").optional(),
  city: z.string().max(100, "Maximum length is 100").optional(),
  details: z.record(z.any()).optional(),
  risk_score: z.number().int().optional(),
  risk_level: z.enum(["low", "medium", "high", "critical"]).optional(),
  created_at: z.string().optional()
})
export type AuditLog = z.infer<typeof AuditLogSchema>
export const TokenObtainPairSchema = z.object({
  email: z.string().min(1, "Minimum length is 1"),
  password: z.string().min(1, "Minimum length is 1")
})
export type TokenObtainPair = z.infer<typeof TokenObtainPairSchema>
export const TokenRefreshSchema = z.object({
  refresh: z.string().min(1, "Minimum length is 1"),
  access: z.string().min(1, "Minimum length is 1").optional()
})
export type TokenRefresh = z.infer<typeof TokenRefreshSchema>
export const TokenVerifySchema = z.object({
  token: z.string().min(1, "Minimum length is 1")
})
export type TokenVerify = z.infer<typeof TokenVerifySchema>
export const ProviderAuthSchema = z.object({
  access: z.string().min(1, "Minimum length is 1").optional(),
  refresh: z.string().min(1, "Minimum length is 1").optional(),
  user: z.string().min(1, "Minimum length is 1").optional()
})
export type ProviderAuth = z.infer<typeof ProviderAuthSchema>
export const UserPublicSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  username: z.string().min(1, "Minimum length is 1").optional(),
  email: z.string().min(1, "Minimum length is 1").max(255, "Maximum length is 255").email("Invalid email format"),
  user_type: z.enum(["customer", "vip", "guest", "partner", "employee", "manager", "admin"]).optional(),
  first_name: z.string().max(30, "Maximum length is 30").optional(),
  last_name: z.string().max(30, "Maximum length is 30").optional(),
  full_name: z.string().min(1, "Minimum length is 1").optional(),
  is_active: z.boolean().optional(),
  profile: z.string().optional(),
  default_branch: z.string().uuid("Invalid UUID format").optional(),
  loyalty_points: z.number().int().optional(),
  password: z.string().min(1, "Minimum length is 1").optional(),
  data_consent: z.record(z.any()).optional()
})
export type UserPublic = z.infer<typeof UserPublicSchema>
export const ActivationSchema = z.object({
  uid: z.string().min(1, "Minimum length is 1"),
  token: z.string().min(1, "Minimum length is 1")
})
export type Activation = z.infer<typeof ActivationSchema>
export const SendEmailResetSchema = z.object({
  email: z.string().min(1, "Minimum length is 1").email("Invalid email format")
})
export type SendEmailReset = z.infer<typeof SendEmailResetSchema>
export const UsernameResetConfirmSchema = z.object({
  new_email: z.string().min(1, "Minimum length is 1").max(255, "Maximum length is 255").email("Invalid email format")
})
export type UsernameResetConfirm = z.infer<typeof UsernameResetConfirmSchema>
export const PasswordResetConfirmRetypeSchema = z.object({
  uid: z.string().min(1, "Minimum length is 1"),
  token: z.string().min(1, "Minimum length is 1"),
  new_password: z.string().min(1, "Minimum length is 1"),
  re_new_password: z.string().min(1, "Minimum length is 1")
})
export type PasswordResetConfirmRetype = z.infer<typeof PasswordResetConfirmRetypeSchema>
export const SetUsernameSchema = z.object({
  current_password: z.string().min(1, "Minimum length is 1"),
  new_email: z.string().min(1, "Minimum length is 1").max(255, "Maximum length is 255").email("Invalid email format")
})
export type SetUsername = z.infer<typeof SetUsernameSchema>
export const SetPasswordSchema = z.object({
  new_password: z.string().min(1, "Minimum length is 1"),
  current_password: z.string().min(1, "Minimum length is 1")
})
export type SetPassword = z.infer<typeof SetPasswordSchema>
export const BranchSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  company: z.string().uuid("Invalid UUID format"),
  company_name: z.string().min(1, "Minimum length is 1").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  branch_name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  branch_name_english: z.string().max(200, "Maximum length is 200").optional(),
  is_primary: z.boolean().optional(),
  is_headquarters: z.boolean().optional(),
  fiscal_year_start_month: z.number().int().min(1, "Minimum value is 1").max(12, "Maximum value is 12").optional(),
  fiscal_year_end_month: z.number().int().min(1, "Minimum value is 1").max(12, "Maximum value is 12").optional(),
  current_fiscal_year: z.number().int().min(-2147483648, "Minimum value is -2147483648").max(2147483647, "Maximum value is 2147483647"),
  use_cost_center: z.boolean().optional(),
  use_sales_tax: z.boolean().optional(),
  use_vat_tax: z.boolean().optional(),
  use_carry_fee: z.boolean().optional(),
  use_expire_date: z.boolean().optional(),
  use_batch_no: z.boolean().optional(),
  use_barcode: z.boolean().optional(),
  use_multi_currency: z.boolean().optional(),
  email: z.string().max(255, "Maximum length is 255").email("Invalid email format").optional(),
  phone_number: z.string().max(128, "Maximum length is 128").optional(),
  fax_number: z.string().max(128, "Maximum length is 128").optional(),
  address: z.string().optional(),
  city: z.string().max(100, "Maximum length is 100").optional(),
  state_province: z.string().max(100, "Maximum length is 100").optional(),
  country: z.string().max(100, "Maximum length is 100").optional(),
  postal_code: z.string().max(20, "Maximum length is 20").optional(),
  default_currency: z.string().uuid("Invalid UUID format").optional(),
  timezone: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50").optional(),
  manager: z.string().uuid("Invalid UUID format").optional(),
  manager_name: z.string().min(1, "Minimum length is 1").optional(),
  is_active: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional()
})
export type Branch = z.infer<typeof BranchSchema>
export const BudgetSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  fiscal_year: z.number().int().min(-2147483648, "Minimum value is -2147483648").max(2147483647, "Maximum value is 2147483647"),
  account: z.string().uuid("Invalid UUID format"),
  cost_center: z.string().uuid("Invalid UUID format"),
  item: z.string().uuid("Invalid UUID format"),
  budgeted_amount: z.string(),
  actual_amount: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Budget = z.infer<typeof BudgetSchema>
export const MediaSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  file: z.string().url("Invalid URL format").optional(),
  alt_text: z.string().max(100, "Maximum length is 100").optional(),
  display_order: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  media_type: z.enum(["image", "video", "document", "other"]).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Media = z.infer<typeof MediaSchema>
export const CampaignSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  slug: z.string().min(1, "Minimum length is 1").regex(/^[-a-zA-Z0-9_]+$/, "Invalid format").optional(),
  campaign_type: z.enum(["email", "social_media", "in_app", "push"]).optional(),
  offer: z.string().uuid("Invalid UUID format").optional(),
  coupon: z.string().uuid("Invalid UUID format").optional(),
  target_users: z.array(z.string().uuid("Invalid UUID format")).optional(),
  target_countries: z.record(z.any()).optional(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().optional(),
  impressions: z.number().int().optional(),
  clicks: z.number().int().optional(),
  conversions: z.number().int().optional(),
  conversion_rate: z.string().optional(),
  media: z.array(MediaSchema).optional(),
  content: z.string().min(1, "Minimum length is 1"),
  call_to_action: z.string().max(100, "Maximum length is 100").optional(),
  analytics_data: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Campaign = z.infer<typeof CampaignSchema>
export const LicenseTypeSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  category: z.enum(["trial", "basic", "standard", "premium", "enterprise", "custom"]).optional(),
  description: z.string().optional(),
  max_users: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  max_branches: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  max_transactions_per_month: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  max_storage_gb: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  allow_multi_currency: z.boolean().optional(),
  allow_advanced_reporting: z.boolean().optional(),
  allow_api_access: z.boolean().optional(),
  allow_integrations: z.boolean().optional(),
  allow_custom_fields: z.boolean().optional(),
  allow_workflow_automation: z.boolean().optional(),
  support_level: z.enum(["none", "email", "priority", "dedicated"]).optional(),
  monthly_price: z.string().optional(),
  yearly_price: z.string().optional(),
  is_available: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional()
})
export type LicenseType = z.infer<typeof LicenseTypeSchema>
export const LicenseSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  license_key: z.string().min(1, "Minimum length is 1").optional(),
  license_type: LicenseTypeSchema.optional(),
  company: z.string().uuid("Invalid UUID format"),
  company_name: z.string().min(1, "Minimum length is 1").optional(),
  status: z.enum(["pending", "active", "expired", "suspended", "revoked", "trial"]).optional(),
  issued_date: z.string().optional(),
  activation_date: z.string().optional(),
  expiry_date: z.string().optional(),
  last_validated: z.string().optional(),
  current_users: z.number().int().optional(),
  current_branches: z.number().int().optional(),
  monthly_transactions: z.number().int().optional(),
  storage_used_gb: z.string().optional(),
  hardware_fingerprint: z.string().max(255, "Maximum length is 255").optional(),
  license_data: z.record(z.any()).optional(),
  violation_count: z.number().int().optional(),
  last_violation_date: z.string().optional(),
  licensee_name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  licensee_email: z.string().min(1, "Minimum length is 1").max(254, "Maximum length is 254").email("Invalid email format"),
  notes: z.string().optional(),
  validation_status: z.string().optional(),
  is_active: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional()
})
export type License = z.infer<typeof LicenseSchema>
export const CompanySchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  company_name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  company_name_english: z.string().max(200, "Maximum length is 200").optional(),
  registration_number: z.string().max(50, "Maximum length is 50").optional(),
  tax_id: z.string().max(50, "Maximum length is 50").optional(),
  email: z.string().max(255, "Maximum length is 255").email("Invalid email format").optional(),
  phone_number: z.string().max(128, "Maximum length is 128").optional(),
  address: z.string().optional(),
  website: z.string().max(200, "Maximum length is 200").url("Invalid URL format").optional(),
  industry: z.string().max(100, "Maximum length is 100").optional(),
  established_date: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().uuid("Invalid UUID format").optional(),
  license: LicenseSchema.optional(),
  branches_count: z.string().optional(),
  is_active: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional()
})
export type Company = z.infer<typeof CompanySchema>
export const CostCenterSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  parent: z.string().uuid("Invalid UUID format"),
  is_header: z.boolean().optional(),
  budget_limit: z.string().optional(),
  manager: z.string().uuid("Invalid UUID format"),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type CostCenter = z.infer<typeof CostCenterSchema>
export const CouponSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  coupon_type: z.enum(["fixed", "percentage"]).optional(),
  value: z.string(),
  min_order_amount: z.string().optional(),
  max_uses: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  current_uses: z.number().int().optional(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().optional(),
  target_users: z.array(z.string().uuid("Invalid UUID format")).optional(),
  target_items: z.array(z.string().uuid("Invalid UUID format")).optional(),
  media: z.array(MediaSchema).optional(),
  description: z.string().optional(),
  terms_conditions: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Coupon = z.infer<typeof CouponSchema>
export const CurrencySchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50"),
  symbol: z.string().max(5, "Maximum length is 5").optional(),
  is_default: z.boolean().optional(),
  decimal_places: z.number().int().min(0, "Minimum value is 0").max(6, "Maximum value is 6").optional(),
  exchange_rate: z.string().optional(),
  exchange_rate_date: z.string().optional(),
  upper_limit: z.string().optional(),
  lower_limit: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Currency = z.infer<typeof CurrencySchema>
export const CurrencyHistorySchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  currency: z.string().uuid("Invalid UUID format"),
  old_exchange_rate: z.string(),
  new_exchange_rate: z.string(),
  changed_by: z.string().uuid("Invalid UUID format"),
  reason: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type CurrencyHistory = z.infer<typeof CurrencyHistorySchema>
export const InventoryBalanceSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: BranchSchema.optional(),
  branch_id: z.string().uuid("Invalid UUID format"),
  item: z.string().uuid("Invalid UUID format"),
  location: z.string().max(50, "Maximum length is 50").optional(),
  batch_number: z.string().max(50, "Maximum length is 50").optional(),
  expiry_date: z.string().optional(),
  available_quantity: z.string().optional(),
  reserved_quantity: z.string().optional(),
  average_cost: z.string().optional(),
  last_movement_date: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type InventoryBalance = z.infer<typeof InventoryBalanceSchema>
export const ItemBarcodeSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  item_id: z.string().uuid("Invalid UUID format"),
  barcode: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50"),
  barcode_type: z.enum(["ean13", "ean8", "upc", "code128", "code39", "qr", "other"]).optional(),
  unit_id: z.string().uuid("Invalid UUID format"),
  is_primary: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type ItemBarcode = z.infer<typeof ItemBarcodeSchema>
export const StoreGroupSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: BranchSchema.optional(),
  branch_id: z.string().uuid("Invalid UUID format"),
  code: z.string().max(20, "Maximum length is 20").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  slug: z.string().min(1, "Minimum length is 1").regex(/^[-a-zA-Z0-9_]+$/, "Invalid format").optional(),
  cost_method: z.enum(["average", "fifo", "lifo", "standard"]).optional(),
  stock_account: AccountSchema.optional(),
  stock_account_id: z.string().uuid("Invalid UUID format"),
  sales_account: AccountSchema.optional(),
  sales_account_id: z.string().uuid("Invalid UUID format"),
  cost_of_sales_account: AccountSchema.optional(),
  cost_of_sales_account_id: z.string().uuid("Invalid UUID format"),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type StoreGroup = z.infer<typeof StoreGroupSchema>
export const ItemGroupSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: BranchSchema.optional(),
  branch_id: z.string().uuid("Invalid UUID format"),
  store_group: StoreGroupSchema.optional(),
  store_group_id: z.string().uuid("Invalid UUID format"),
  code: z.string().max(20, "Maximum length is 20").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  slug: z.string().min(1, "Minimum length is 1").regex(/^[-a-zA-Z0-9_]+$/, "Invalid format").optional(),
  parent: z.string().uuid("Invalid UUID format").optional(),
  group_type: z.enum(["product", "service", "both"]).optional(),
  media: z.array(MediaSchema).optional(),
  description: z.string().optional(),
  meta_title: z.string().max(60, "Maximum length is 60").optional(),
  meta_description: z.string().max(160, "Maximum length is 160").optional(),
  is_featured: z.boolean().optional(),
  visibility: z.enum(["public", "registered", "hidden"]).optional(),
  children: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type ItemGroup = z.infer<typeof ItemGroupSchema>
export const ItemUnitSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  item_id: z.string().uuid("Invalid UUID format"),
  code: z.string().max(20, "Maximum length is 20").optional(),
  name: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50"),
  conversion_factor: z.string().optional(),
  unit_price: z.string().optional(),
  unit_cost: z.string().optional(),
  is_default: z.boolean().optional(),
  is_purchase_unit: z.boolean().optional(),
  is_sales_unit: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type ItemUnit = z.infer<typeof ItemUnitSchema>
export const ItemSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: BranchSchema.optional(),
  branch_id: z.string().uuid("Invalid UUID format"),
  item_group: ItemGroupSchema.optional(),
  item_group_id: z.string().uuid("Invalid UUID format"),
  code: z.string().max(20, "Maximum length is 20").optional(),
  name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  slug: z.string().min(1, "Minimum length is 1").regex(/^[-a-zA-Z0-9_]+$/, "Invalid format").optional(),
  item_type: z.enum(["product", "service", "kit"]).optional(),
  base_unit: z.string().min(1, "Minimum length is 1").max(20, "Maximum length is 20"),
  shelf_location: z.string().max(50, "Maximum length is 50").optional(),
  weight: z.string().optional(),
  volume: z.string().optional(),
  manufacturer: z.string().max(100, "Maximum length is 100").optional(),
  brand: z.string().max(100, "Maximum length is 100").optional(),
  size: z.string().max(50, "Maximum length is 50").optional(),
  color: z.string().max(50, "Maximum length is 50").optional(),
  standard_cost: z.string().optional(),
  sales_price: z.string().optional(),
  wholesale_price: z.string().optional(),
  minimum_price: z.string().optional(),
  maximum_price: z.string().optional(),
  media: z.array(MediaSchema).optional(),
  meta_title: z.string().max(60, "Maximum length is 60").optional(),
  meta_description: z.string().max(160, "Maximum length is 160").optional(),
  tags: z.string().max(255, "Maximum length is 255").optional(),
  average_rating: z.string().optional(),
  review_count: z.number().int().optional(),
  is_featured: z.boolean().optional(),
  visibility: z.enum(["public", "registered", "hidden"]).optional(),
  reorder_level: z.string().optional(),
  maximum_stock: z.string().optional(),
  minimum_order_quantity: z.string().optional(),
  markup_percentage: z.string().optional(),
  discount_percentage: z.string().optional(),
  commission_percentage: z.string().optional(),
  vat_percentage: z.string().optional(),
  handling_fee: z.string().optional(),
  is_service_item: z.boolean().optional(),
  track_expiry: z.boolean().optional(),
  track_batches: z.boolean().optional(),
  allow_discount: z.boolean().optional(),
  allow_bonus: z.boolean().optional(),
  expiry_warning_days: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  description: z.string().optional(),
  short_description: z.string().max(255, "Maximum length is 255").optional(),
  internal_notes: z.string().optional(),
  units: z.array(ItemUnitSchema).optional(),
  barcodes: z.array(ItemBarcodeSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Item = z.infer<typeof ItemSchema>
export const KeyboardShortcutsSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  branch_name: z.string().min(1, "Minimum length is 1").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  action_name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  display_name: z.string().min(1, "Minimum length is 1").max(150, "Maximum length is 150"),
  description: z.string().optional(),
  category: z.enum(["general", "navigation", "forms", "reports", "inventory", "sales", "accounting", "admin", "custom"]).optional(),
  key_combination: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50"),
  primary_key: z.string().min(1, "Minimum length is 1").max(20, "Maximum length is 20"),
  modifiers: z.string().max(50, "Maximum length is 50").optional(),
  is_enabled: z.boolean().optional(),
  is_system_default: z.boolean().optional(),
  is_customizable: z.boolean().optional(),
  is_global: z.boolean().optional(),
  context: z.string().max(100, "Maximum length is 100").optional(),
  page_url_pattern: z.string().max(200, "Maximum length is 200").optional(),
  priority: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  sort_order: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  javascript_function: z.string().max(500, "Maximum length is 500").optional(),
  alternative_combination: z.string().max(50, "Maximum length is 50").optional(),
  is_active: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional()
})
export type KeyboardShortcuts = z.infer<typeof KeyboardShortcutsSchema>
export const NotificationTemplateSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  notification_type: z.enum(["welcome", "password_reset", "security_alert", "inventory_low", "inventory_expired", "transaction_approved", "transaction_rejected", "payment_due", "payment_overdue", "system_maintenance", "custom"]),
  channel: z.enum(["email", "sms", "whatsapp", "in_app", "push"]),
  subject: z.string().max(200, "Maximum length is 200").optional(),
  content: z.string().min(1, "Minimum length is 1"),
  html_content: z.string().optional(),
  variables: z.record(z.any()).optional(),
  is_default: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>
export const NotificationSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  template: NotificationTemplateSchema.optional(),
  recipient: z.string().uuid("Invalid UUID format").optional(),
  recipient_email: z.string().min(1, "Minimum length is 1").email("Invalid email format").optional(),
  recipient_phone: z.string().min(1, "Minimum length is 1").optional(),
  channel: z.enum(["email", "sms", "whatsapp", "in_app", "push"]),
  notification_type: z.enum(["welcome", "password_reset", "security_alert", "inventory_low", "inventory_expired", "transaction_approved", "transaction_rejected", "payment_due", "payment_overdue", "system_maintenance", "custom"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  subject: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  content: z.string().min(1, "Minimum length is 1"),
  html_content: z.string().optional(),
  context_data: z.record(z.any()).optional(),
  attachments: z.array(z.string().uuid("Invalid UUID format")).optional(),
  status: z.enum(["pending", "sent", "delivered", "read", "failed", "cancelled"]).optional(),
  scheduled_at: z.string().optional(),
  sent_at: z.string().optional(),
  delivered_at: z.string().optional(),
  read_at: z.string().optional(),
  error_message: z.string().min(1, "Minimum length is 1").optional(),
  retry_count: z.number().int().optional(),
  max_retries: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  external_id: z.string().min(1, "Minimum length is 1").optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Notification = z.infer<typeof NotificationSchema>
export const NotificationLogSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  notification: NotificationSchema.optional(),
  action: z.enum(["created", "sent", "delivered", "read", "failed", "retried", "cancelled"]).optional(),
  details: z.record(z.any()).optional(),
  error_message: z.string().min(1, "Minimum length is 1").optional(),
  created_at: z.string().optional()
})
export type NotificationLog = z.infer<typeof NotificationLogSchema>
export const InternalMessageSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  sender: z.string().optional(),
  recipient: z.string().uuid("Invalid UUID format"),
  subject: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  content: z.string().min(1, "Minimum length is 1"),
  attachments: z.array(z.string().uuid("Invalid UUID format")).optional(),
  is_read: z.boolean().optional(),
  read_at: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type InternalMessage = z.infer<typeof InternalMessageSchema>
export const UserNoteSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  user: z.string().optional(),
  title: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  content: z.string().min(1, "Minimum length is 1"),
  attachments: z.array(z.string().uuid("Invalid UUID format")).optional(),
  reminder_date: z.string().optional(),
  is_reminder_sent: z.boolean().optional(),
  tags: z.string().max(200, "Maximum length is 200").optional(),
  color: z.string().min(1, "Minimum length is 1").max(7, "Maximum length is 7").optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type UserNote = z.infer<typeof UserNoteSchema>
export const OfferSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  code: z.string().min(1, "Minimum length is 1").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  slug: z.string().min(1, "Minimum length is 1").regex(/^[-a-zA-Z0-9_]+$/, "Invalid format").optional(),
  offer_type: z.enum(["discount", "buy_x_get_y", "bundle", "loyalty_points", "free_shipping"]).optional(),
  target_type: z.enum(["all", "user", "country", "item", "item_group", "store_group"]).optional(),
  target_users: z.array(z.string().uuid("Invalid UUID format")).optional(),
  target_countries: z.record(z.any()).optional(),
  target_items: z.array(z.string().uuid("Invalid UUID format")).optional(),
  target_item_groups: z.array(z.string().uuid("Invalid UUID format")).optional(),
  target_store_groups: z.array(z.string().uuid("Invalid UUID format")).optional(),
  discount_percentage: z.string().optional(),
  discount_amount: z.string().optional(),
  buy_quantity: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  get_quantity: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  loyalty_points_earned: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().optional(),
  max_uses: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  current_uses: z.number().int().optional(),
  media: z.array(MediaSchema).optional(),
  description: z.string().optional(),
  terms_conditions: z.string().optional(),
  meta_title: z.string().max(60, "Maximum length is 60").optional(),
  meta_description: z.string().max(160, "Maximum length is 160").optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type Offer = z.infer<typeof OfferSchema>
export const OpeningBalanceSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  account: z.string().uuid("Invalid UUID format"),
  item: z.string().uuid("Invalid UUID format"),
  fiscal_year: z.number().int().min(-2147483648, "Minimum value is -2147483648").max(2147483647, "Maximum value is 2147483647"),
  opening_date: z.string(),
  debit_amount: z.string().optional(),
  credit_amount: z.string().optional(),
  quantity: z.string().optional(),
  unit_cost: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type OpeningBalance = z.infer<typeof OpeningBalanceSchema>
export const UserProfileSchema = z.object({
  avatar: z.string().uuid("Invalid UUID format").optional(),
  avatar_url: z.string().optional(),
  bio: z.string().max(500, "Maximum length is 500").optional(),
  phone_number: z.string().max(128, "Maximum length is 128").optional(),
  address: z.string().optional(),
  nationality: z.string().max(50, "Maximum length is 50").optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "prefer_not_to_say"]).optional(),
  notifications: z.record(z.any()).optional(),
  profile_visibility: z.enum(["public", "private", "colleagues"]).optional(),
  preferred_payment_method: z.enum(["credit_card", "debit_card", "paypal", "cash_on_delivery"]).optional(),
  marketing_opt_in: z.boolean().optional(),
  terms_accepted: z.boolean().optional(),
  terms_accepted_at: z.string().optional(),
  terms_version: z.string().max(20, "Maximum length is 20").optional(),
  data_consent: z.record(z.any()).optional(),
  branches: z.string().optional(),
  is_complete: z.string().optional()
})
export type UserProfile = z.infer<typeof UserProfileSchema>
export const ReportCategorySchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  name: z.string().min(1, "Minimum length is 1").max(100, "Maximum length is 100"),
  description: z.string().optional(),
  icon: z.string().max(50, "Maximum length is 50").optional(),
  sort_order: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  is_active: z.boolean().optional()
})
export type ReportCategory = z.infer<typeof ReportCategorySchema>
export const ReportTemplateSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  category: ReportCategorySchema.optional(),
  code: z.string().max(20, "Maximum length is 20").optional(),
  name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  description: z.string().optional(),
  report_type: z.enum(["tabular", "chart", "dashboard", "export"]).optional(),
  query_config: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  columns: z.record(z.any()).optional(),
  chart_config: z.record(z.any()).optional(),
  formatting_rules: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>
export const InsuranceSubscriberSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  subscriber_code: z.string().min(1, "Minimum length is 1").max(20, "Maximum length is 20"),
  subscriber_name: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  insurance_company: z.string().min(1, "Minimum length is 1").max(200, "Maximum length is 200"),
  policy_number: z.string().min(1, "Minimum length is 1").max(50, "Maximum length is 50"),
  coverage_percentage: z.string().optional(),
  expiry_date: z.string().optional(),
  phone_number: z.string().max(128, "Maximum length is 128").optional(),
  is_active: z.boolean().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format")
})
export type InsuranceSubscriber = z.infer<typeof InsuranceSubscriberSchema>
export const SystemSettingsSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  branch: z.string().uuid("Invalid UUID format"),
  branch_name: z.string().min(1, "Minimum length is 1").optional(),
  database_server: z.string().optional(),
  database_name: z.string().optional(),
  database_username: z.string().optional(),
  database_password: z.string().optional(),
  connection_timeout: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  session_timeout: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  max_login_attempts: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  account_lockout_duration: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  show_warnings: z.boolean().optional(),
  check_sales_price: z.boolean().optional(),
  enable_photo_storage: z.boolean().optional(),
  reports_path: z.string().max(255, "Maximum length is 255").optional(),
  backup_path: z.string().max(255, "Maximum length is 255").optional(),
  notifications: z.record(z.any()).optional(),
  require_two_factor_auth: z.boolean().optional(),
  password_expiry_days: z.number().int().min(0, "Minimum value is 0").max(2147483647, "Maximum value is 2147483647").optional(),
  minimum_password_length: z.number().int().min(6, "Minimum value is 6").max(50, "Maximum value is 50").optional(),
  is_active: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid("Invalid UUID format").optional(),
  updated_by: z.string().uuid("Invalid UUID format").optional()
})
export type SystemSettings = z.infer<typeof SystemSettingsSchema>
export const UserCouponSchema = z.object({
  id: z.string().uuid("Invalid UUID format").optional(),
  user: z.string().uuid("Invalid UUID format"),
  coupon: z.string().uuid("Invalid UUID format"),
  branch: z.string().uuid("Invalid UUID format"),
  redemption_date: z.string().optional(),
  order: z.string().uuid("Invalid UUID format").optional(),
  is_used: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})
export type UserCoupon = z.infer<typeof UserCouponSchema>
/**
 * Success response schema for GET /account-types/
 * Status: 200
 * 
 */
export const AccountTypesListResponseSchema = z.array(AccountTypeSchema)

export type AccountTypesListResponse = z.infer<typeof AccountTypesListResponseSchema>
/**
 * Request schema for POST /account-types/
 */
export const AccountTypesCreateRequestSchema = AccountTypeSchema
export type AccountTypesCreateRequest = z.infer<typeof AccountTypesCreateRequestSchema>
/**
 * Success response schema for POST /account-types/
 * Status: 201
 * 
 */
export const AccountTypesCreateResponseSchema = AccountTypeSchema

export type AccountTypesCreateResponse = z.infer<typeof AccountTypesCreateResponseSchema>
/**
 * Success response schema for GET /account-types/{id}/
 * Status: 200
 * 
 */
export const AccountTypesReadResponseSchema = AccountTypeSchema

export type AccountTypesReadResponse = z.infer<typeof AccountTypesReadResponseSchema>
/**
 * Parameters schema for GET /account-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountTypesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountTypesReadParams = z.infer<typeof AccountTypesReadParamsSchema>
/**
 * Request schema for PUT /account-types/{id}/
 */
export const AccountTypesUpdateRequestSchema = AccountTypeSchema
export type AccountTypesUpdateRequest = z.infer<typeof AccountTypesUpdateRequestSchema>
/**
 * Success response schema for PUT /account-types/{id}/
 * Status: 200
 * 
 */
export const AccountTypesUpdateResponseSchema = AccountTypeSchema

export type AccountTypesUpdateResponse = z.infer<typeof AccountTypesUpdateResponseSchema>
/**
 * Parameters schema for PUT /account-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountTypesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountTypesUpdateParams = z.infer<typeof AccountTypesUpdateParamsSchema>
/**
 * Request schema for PATCH /account-types/{id}/
 */
export const AccountTypesPartialUpdateRequestSchema = AccountTypeSchema
export type AccountTypesPartialUpdateRequest = z.infer<typeof AccountTypesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /account-types/{id}/
 * Status: 200
 * 
 */
export const AccountTypesPartialUpdateResponseSchema = AccountTypeSchema

export type AccountTypesPartialUpdateResponse = z.infer<typeof AccountTypesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /account-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountTypesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountTypesPartialUpdateParams = z.infer<typeof AccountTypesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /account-types/{id}/
 * Status: 204
 * 
 */
export const AccountTypesDeleteResponseSchema = z.void()

export type AccountTypesDeleteResponse = z.infer<typeof AccountTypesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /account-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountTypesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountTypesDeleteParams = z.infer<typeof AccountTypesDeleteParamsSchema>
/**
 * Success response schema for GET /accounting-periods/
 * Status: 200
 * 
 */
export const AccountingPeriodsListResponseSchema = z.array(AccountingPeriodSchema)

export type AccountingPeriodsListResponse = z.infer<typeof AccountingPeriodsListResponseSchema>
/**
 * Request schema for POST /accounting-periods/
 */
export const AccountingPeriodsCreateRequestSchema = AccountingPeriodSchema
export type AccountingPeriodsCreateRequest = z.infer<typeof AccountingPeriodsCreateRequestSchema>
/**
 * Success response schema for POST /accounting-periods/
 * Status: 201
 * 
 */
export const AccountingPeriodsCreateResponseSchema = AccountingPeriodSchema

export type AccountingPeriodsCreateResponse = z.infer<typeof AccountingPeriodsCreateResponseSchema>
/**
 * Success response schema for GET /accounting-periods/{id}/
 * Status: 200
 * 
 */
export const AccountingPeriodsReadResponseSchema = AccountingPeriodSchema

export type AccountingPeriodsReadResponse = z.infer<typeof AccountingPeriodsReadResponseSchema>
/**
 * Parameters schema for GET /accounting-periods/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountingPeriodsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountingPeriodsReadParams = z.infer<typeof AccountingPeriodsReadParamsSchema>
/**
 * Request schema for PUT /accounting-periods/{id}/
 */
export const AccountingPeriodsUpdateRequestSchema = AccountingPeriodSchema
export type AccountingPeriodsUpdateRequest = z.infer<typeof AccountingPeriodsUpdateRequestSchema>
/**
 * Success response schema for PUT /accounting-periods/{id}/
 * Status: 200
 * 
 */
export const AccountingPeriodsUpdateResponseSchema = AccountingPeriodSchema

export type AccountingPeriodsUpdateResponse = z.infer<typeof AccountingPeriodsUpdateResponseSchema>
/**
 * Parameters schema for PUT /accounting-periods/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountingPeriodsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountingPeriodsUpdateParams = z.infer<typeof AccountingPeriodsUpdateParamsSchema>
/**
 * Request schema for PATCH /accounting-periods/{id}/
 */
export const AccountingPeriodsPartialUpdateRequestSchema = AccountingPeriodSchema
export type AccountingPeriodsPartialUpdateRequest = z.infer<typeof AccountingPeriodsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /accounting-periods/{id}/
 * Status: 200
 * 
 */
export const AccountingPeriodsPartialUpdateResponseSchema = AccountingPeriodSchema

export type AccountingPeriodsPartialUpdateResponse = z.infer<typeof AccountingPeriodsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /accounting-periods/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountingPeriodsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountingPeriodsPartialUpdateParams = z.infer<typeof AccountingPeriodsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /accounting-periods/{id}/
 * Status: 204
 * 
 */
export const AccountingPeriodsDeleteResponseSchema = z.void()

export type AccountingPeriodsDeleteResponse = z.infer<typeof AccountingPeriodsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /accounting-periods/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountingPeriodsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountingPeriodsDeleteParams = z.infer<typeof AccountingPeriodsDeleteParamsSchema>
/**
 * Success response schema for GET /accounts/
 * Status: 200
 * 
 */
export const AccountsListResponseSchema = z.array(AccountSchema)

export type AccountsListResponse = z.infer<typeof AccountsListResponseSchema>
/**
 * Request schema for POST /accounts/
 */
export const AccountsCreateRequestSchema = AccountSchema
export type AccountsCreateRequest = z.infer<typeof AccountsCreateRequestSchema>
/**
 * Success response schema for POST /accounts/
 * Status: 201
 * 
 */
export const AccountsCreateResponseSchema = AccountSchema

export type AccountsCreateResponse = z.infer<typeof AccountsCreateResponseSchema>
/**
 * Success response schema for GET /accounts/{id}/
 * Status: 200
 * 
 */
export const AccountsReadResponseSchema = AccountSchema

export type AccountsReadResponse = z.infer<typeof AccountsReadResponseSchema>
/**
 * Parameters schema for GET /accounts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountsReadParams = z.infer<typeof AccountsReadParamsSchema>
/**
 * Request schema for PUT /accounts/{id}/
 */
export const AccountsUpdateRequestSchema = AccountSchema
export type AccountsUpdateRequest = z.infer<typeof AccountsUpdateRequestSchema>
/**
 * Success response schema for PUT /accounts/{id}/
 * Status: 200
 * 
 */
export const AccountsUpdateResponseSchema = AccountSchema

export type AccountsUpdateResponse = z.infer<typeof AccountsUpdateResponseSchema>
/**
 * Parameters schema for PUT /accounts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountsUpdateParams = z.infer<typeof AccountsUpdateParamsSchema>
/**
 * Request schema for PATCH /accounts/{id}/
 */
export const AccountsPartialUpdateRequestSchema = AccountSchema
export type AccountsPartialUpdateRequest = z.infer<typeof AccountsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /accounts/{id}/
 * Status: 200
 * 
 */
export const AccountsPartialUpdateResponseSchema = AccountSchema

export type AccountsPartialUpdateResponse = z.infer<typeof AccountsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /accounts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountsPartialUpdateParams = z.infer<typeof AccountsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /accounts/{id}/
 * Status: 204
 * 
 */
export const AccountsDeleteResponseSchema = z.void()

export type AccountsDeleteResponse = z.infer<typeof AccountsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /accounts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountsDeleteParams = z.infer<typeof AccountsDeleteParamsSchema>
/**
 * Request schema for POST /accounts/{id}/update-balance/
 */
export const AccountsUpdateBalanceRequestSchema = AccountSchema
export type AccountsUpdateBalanceRequest = z.infer<typeof AccountsUpdateBalanceRequestSchema>
/**
 * Success response schema for POST /accounts/{id}/update-balance/
 * Status: 201
 * 
 */
export const AccountsUpdateBalanceResponseSchema = AccountSchema

export type AccountsUpdateBalanceResponse = z.infer<typeof AccountsUpdateBalanceResponseSchema>
/**
 * Parameters schema for POST /accounts/{id}/update-balance/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AccountsUpdateBalanceParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AccountsUpdateBalanceParams = z.infer<typeof AccountsUpdateBalanceParamsSchema>

export const ApiWebhooksDeliveriesListResponseSchema = z.array(WebhookDeliverySchema)

export type ApiWebhooksDeliveriesListResponse = z.infer<typeof ApiWebhooksDeliveriesListResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/deliveries/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ApiWebhooksDeliveriesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ApiWebhooksDeliveriesListParams = z.infer<typeof ApiWebhooksDeliveriesListParamsSchema>
/**
 * Request schema for POST /api/webhooks/deliveries/
 */
export const ApiWebhooksDeliveriesCreateRequestSchema = WebhookDeliverySchema
export type ApiWebhooksDeliveriesCreateRequest = z.infer<typeof ApiWebhooksDeliveriesCreateRequestSchema>
/**
 * Success response schema for POST /api/webhooks/deliveries/
 * Status: 201
 * 
 */
export const ApiWebhooksDeliveriesCreateResponseSchema = WebhookDeliverySchema

export type ApiWebhooksDeliveriesCreateResponse = z.infer<typeof ApiWebhooksDeliveriesCreateResponseSchema>
/**
 * Success response schema for GET /api/webhooks/deliveries/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksDeliveriesReadResponseSchema = WebhookDeliverySchema

export type ApiWebhooksDeliveriesReadResponse = z.infer<typeof ApiWebhooksDeliveriesReadResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/deliveries/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksDeliveriesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksDeliveriesReadParams = z.infer<typeof ApiWebhooksDeliveriesReadParamsSchema>
/**
 * Request schema for PUT /api/webhooks/deliveries/{id}/
 */
export const ApiWebhooksDeliveriesUpdateRequestSchema = WebhookDeliverySchema
export type ApiWebhooksDeliveriesUpdateRequest = z.infer<typeof ApiWebhooksDeliveriesUpdateRequestSchema>
/**
 * Success response schema for PUT /api/webhooks/deliveries/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksDeliveriesUpdateResponseSchema = WebhookDeliverySchema

export type ApiWebhooksDeliveriesUpdateResponse = z.infer<typeof ApiWebhooksDeliveriesUpdateResponseSchema>
/**
 * Parameters schema for PUT /api/webhooks/deliveries/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksDeliveriesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksDeliveriesUpdateParams = z.infer<typeof ApiWebhooksDeliveriesUpdateParamsSchema>
/**
 * Request schema for PATCH /api/webhooks/deliveries/{id}/
 */
export const ApiWebhooksDeliveriesPartialUpdateRequestSchema = WebhookDeliverySchema
export type ApiWebhooksDeliveriesPartialUpdateRequest = z.infer<typeof ApiWebhooksDeliveriesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /api/webhooks/deliveries/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksDeliveriesPartialUpdateResponseSchema = WebhookDeliverySchema

export type ApiWebhooksDeliveriesPartialUpdateResponse = z.infer<typeof ApiWebhooksDeliveriesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /api/webhooks/deliveries/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksDeliveriesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksDeliveriesPartialUpdateParams = z.infer<typeof ApiWebhooksDeliveriesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /api/webhooks/deliveries/{id}/
 * Status: 204
 * 
 */
export const ApiWebhooksDeliveriesDeleteResponseSchema = z.void()

export type ApiWebhooksDeliveriesDeleteResponse = z.infer<typeof ApiWebhooksDeliveriesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /api/webhooks/deliveries/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksDeliveriesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksDeliveriesDeleteParams = z.infer<typeof ApiWebhooksDeliveriesDeleteParamsSchema>
/**
 * Request schema for POST /api/webhooks/deliveries/{id}/retry/
 */
export const ApiWebhooksDeliveriesRetryRequestSchema = WebhookDeliverySchema
export type ApiWebhooksDeliveriesRetryRequest = z.infer<typeof ApiWebhooksDeliveriesRetryRequestSchema>
/**
 * Success response schema for POST /api/webhooks/deliveries/{id}/retry/
 * Status: 201
 * 
 */
export const ApiWebhooksDeliveriesRetryResponseSchema = WebhookDeliverySchema

export type ApiWebhooksDeliveriesRetryResponse = z.infer<typeof ApiWebhooksDeliveriesRetryResponseSchema>
/**
 * Parameters schema for POST /api/webhooks/deliveries/{id}/retry/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksDeliveriesRetryParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksDeliveriesRetryParams = z.infer<typeof ApiWebhooksDeliveriesRetryParamsSchema>
/**
 * Success response schema for GET /api/webhooks/endpoints/
 * Status: 200
 * 
 */
export const ApiWebhooksEndpointsListResponseSchema = z.array(WebhookEndpointSchema)

export type ApiWebhooksEndpointsListResponse = z.infer<typeof ApiWebhooksEndpointsListResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/endpoints/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ApiWebhooksEndpointsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ApiWebhooksEndpointsListParams = z.infer<typeof ApiWebhooksEndpointsListParamsSchema>
/**
 * Request schema for POST /api/webhooks/endpoints/
 */
export const ApiWebhooksEndpointsCreateRequestSchema = WebhookEndpointSchema
export type ApiWebhooksEndpointsCreateRequest = z.infer<typeof ApiWebhooksEndpointsCreateRequestSchema>
/**
 * Success response schema for POST /api/webhooks/endpoints/
 * Status: 201
 * 
 */
export const ApiWebhooksEndpointsCreateResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsCreateResponse = z.infer<typeof ApiWebhooksEndpointsCreateResponseSchema>
/**
 * Success response schema for GET /api/webhooks/endpoints/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksEndpointsReadResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsReadResponse = z.infer<typeof ApiWebhooksEndpointsReadResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/endpoints/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsReadParams = z.infer<typeof ApiWebhooksEndpointsReadParamsSchema>
/**
 * Request schema for PUT /api/webhooks/endpoints/{id}/
 */
export const ApiWebhooksEndpointsUpdateRequestSchema = WebhookEndpointSchema
export type ApiWebhooksEndpointsUpdateRequest = z.infer<typeof ApiWebhooksEndpointsUpdateRequestSchema>
/**
 * Success response schema for PUT /api/webhooks/endpoints/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksEndpointsUpdateResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsUpdateResponse = z.infer<typeof ApiWebhooksEndpointsUpdateResponseSchema>
/**
 * Parameters schema for PUT /api/webhooks/endpoints/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsUpdateParams = z.infer<typeof ApiWebhooksEndpointsUpdateParamsSchema>
/**
 * Request schema for PATCH /api/webhooks/endpoints/{id}/
 */
export const ApiWebhooksEndpointsPartialUpdateRequestSchema = WebhookEndpointSchema
export type ApiWebhooksEndpointsPartialUpdateRequest = z.infer<typeof ApiWebhooksEndpointsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /api/webhooks/endpoints/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksEndpointsPartialUpdateResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsPartialUpdateResponse = z.infer<typeof ApiWebhooksEndpointsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /api/webhooks/endpoints/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsPartialUpdateParams = z.infer<typeof ApiWebhooksEndpointsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /api/webhooks/endpoints/{id}/
 * Status: 204
 * 
 */
export const ApiWebhooksEndpointsDeleteResponseSchema = z.void()

export type ApiWebhooksEndpointsDeleteResponse = z.infer<typeof ApiWebhooksEndpointsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /api/webhooks/endpoints/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsDeleteParams = z.infer<typeof ApiWebhooksEndpointsDeleteParamsSchema>
/**
 * Request schema for POST /api/webhooks/endpoints/{id}/reactivate/
 */
export const ApiWebhooksEndpointsReactivateRequestSchema = WebhookEndpointSchema
export type ApiWebhooksEndpointsReactivateRequest = z.infer<typeof ApiWebhooksEndpointsReactivateRequestSchema>
/**
 * Success response schema for POST /api/webhooks/endpoints/{id}/reactivate/
 * Status: 201
 * 
 */
export const ApiWebhooksEndpointsReactivateResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsReactivateResponse = z.infer<typeof ApiWebhooksEndpointsReactivateResponseSchema>
/**
 * Parameters schema for POST /api/webhooks/endpoints/{id}/reactivate/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsReactivateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsReactivateParams = z.infer<typeof ApiWebhooksEndpointsReactivateParamsSchema>
/**
 * Success response schema for GET /api/webhooks/endpoints/{id}/statistics/
 * Status: 200
 * 
 */
export const ApiWebhooksEndpointsStatisticsResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsStatisticsResponse = z.infer<typeof ApiWebhooksEndpointsStatisticsResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/endpoints/{id}/statistics/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsStatisticsParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsStatisticsParams = z.infer<typeof ApiWebhooksEndpointsStatisticsParamsSchema>
/**
 * Request schema for POST /api/webhooks/endpoints/{id}/suspend/
 */
export const ApiWebhooksEndpointsSuspendRequestSchema = WebhookEndpointSchema
export type ApiWebhooksEndpointsSuspendRequest = z.infer<typeof ApiWebhooksEndpointsSuspendRequestSchema>
/**
 * Success response schema for POST /api/webhooks/endpoints/{id}/suspend/
 * Status: 201
 * 
 */
export const ApiWebhooksEndpointsSuspendResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsSuspendResponse = z.infer<typeof ApiWebhooksEndpointsSuspendResponseSchema>
/**
 * Parameters schema for POST /api/webhooks/endpoints/{id}/suspend/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsSuspendParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsSuspendParams = z.infer<typeof ApiWebhooksEndpointsSuspendParamsSchema>
/**
 * Request schema for POST /api/webhooks/endpoints/{id}/test/
 */
export const ApiWebhooksEndpointsTestRequestSchema = WebhookEndpointSchema
export type ApiWebhooksEndpointsTestRequest = z.infer<typeof ApiWebhooksEndpointsTestRequestSchema>
/**
 * Success response schema for POST /api/webhooks/endpoints/{id}/test/
 * Status: 201
 * 
 */
export const ApiWebhooksEndpointsTestResponseSchema = WebhookEndpointSchema

export type ApiWebhooksEndpointsTestResponse = z.infer<typeof ApiWebhooksEndpointsTestResponseSchema>
/**
 * Parameters schema for POST /api/webhooks/endpoints/{id}/test/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEndpointsTestParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEndpointsTestParams = z.infer<typeof ApiWebhooksEndpointsTestParamsSchema>
/**
 * Success response schema for GET /api/webhooks/events/
 * Status: 200
 * 
 */
export const ApiWebhooksEventsListResponseSchema = z.array(WebhookEventSchema)

export type ApiWebhooksEventsListResponse = z.infer<typeof ApiWebhooksEventsListResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/events/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ApiWebhooksEventsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ApiWebhooksEventsListParams = z.infer<typeof ApiWebhooksEventsListParamsSchema>
/**
 * Request schema for POST /api/webhooks/events/
 */
export const ApiWebhooksEventsCreateRequestSchema = WebhookEventSchema
export type ApiWebhooksEventsCreateRequest = z.infer<typeof ApiWebhooksEventsCreateRequestSchema>
/**
 * Success response schema for POST /api/webhooks/events/
 * Status: 201
 * 
 */
export const ApiWebhooksEventsCreateResponseSchema = WebhookEventSchema

export type ApiWebhooksEventsCreateResponse = z.infer<typeof ApiWebhooksEventsCreateResponseSchema>
/**
 * Success response schema for GET /api/webhooks/events/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksEventsReadResponseSchema = WebhookEventSchema

export type ApiWebhooksEventsReadResponse = z.infer<typeof ApiWebhooksEventsReadResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/events/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEventsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEventsReadParams = z.infer<typeof ApiWebhooksEventsReadParamsSchema>
/**
 * Request schema for PUT /api/webhooks/events/{id}/
 */
export const ApiWebhooksEventsUpdateRequestSchema = WebhookEventSchema
export type ApiWebhooksEventsUpdateRequest = z.infer<typeof ApiWebhooksEventsUpdateRequestSchema>
/**
 * Success response schema for PUT /api/webhooks/events/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksEventsUpdateResponseSchema = WebhookEventSchema

export type ApiWebhooksEventsUpdateResponse = z.infer<typeof ApiWebhooksEventsUpdateResponseSchema>
/**
 * Parameters schema for PUT /api/webhooks/events/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEventsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEventsUpdateParams = z.infer<typeof ApiWebhooksEventsUpdateParamsSchema>
/**
 * Request schema for PATCH /api/webhooks/events/{id}/
 */
export const ApiWebhooksEventsPartialUpdateRequestSchema = WebhookEventSchema
export type ApiWebhooksEventsPartialUpdateRequest = z.infer<typeof ApiWebhooksEventsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /api/webhooks/events/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksEventsPartialUpdateResponseSchema = WebhookEventSchema

export type ApiWebhooksEventsPartialUpdateResponse = z.infer<typeof ApiWebhooksEventsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /api/webhooks/events/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEventsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEventsPartialUpdateParams = z.infer<typeof ApiWebhooksEventsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /api/webhooks/events/{id}/
 * Status: 204
 * 
 */
export const ApiWebhooksEventsDeleteResponseSchema = z.void()

export type ApiWebhooksEventsDeleteResponse = z.infer<typeof ApiWebhooksEventsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /api/webhooks/events/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksEventsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksEventsDeleteParams = z.infer<typeof ApiWebhooksEventsDeleteParamsSchema>
/**
 * Success response schema for GET /api/webhooks/logs/
 * Status: 200
 * 
 */
export const ApiWebhooksLogsListResponseSchema = z.array(WebhookEventLogSchema)

export type ApiWebhooksLogsListResponse = z.infer<typeof ApiWebhooksLogsListResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/logs/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ApiWebhooksLogsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ApiWebhooksLogsListParams = z.infer<typeof ApiWebhooksLogsListParamsSchema>
/**
 * Request schema for POST /api/webhooks/logs/
 */
export const ApiWebhooksLogsCreateRequestSchema = WebhookEventLogSchema
export type ApiWebhooksLogsCreateRequest = z.infer<typeof ApiWebhooksLogsCreateRequestSchema>
/**
 * Success response schema for POST /api/webhooks/logs/
 * Status: 201
 * 
 */
export const ApiWebhooksLogsCreateResponseSchema = WebhookEventLogSchema

export type ApiWebhooksLogsCreateResponse = z.infer<typeof ApiWebhooksLogsCreateResponseSchema>
/**
 * Success response schema for GET /api/webhooks/logs/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksLogsReadResponseSchema = WebhookEventLogSchema

export type ApiWebhooksLogsReadResponse = z.infer<typeof ApiWebhooksLogsReadResponseSchema>
/**
 * Parameters schema for GET /api/webhooks/logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksLogsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksLogsReadParams = z.infer<typeof ApiWebhooksLogsReadParamsSchema>
/**
 * Request schema for PUT /api/webhooks/logs/{id}/
 */
export const ApiWebhooksLogsUpdateRequestSchema = WebhookEventLogSchema
export type ApiWebhooksLogsUpdateRequest = z.infer<typeof ApiWebhooksLogsUpdateRequestSchema>
/**
 * Success response schema for PUT /api/webhooks/logs/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksLogsUpdateResponseSchema = WebhookEventLogSchema

export type ApiWebhooksLogsUpdateResponse = z.infer<typeof ApiWebhooksLogsUpdateResponseSchema>
/**
 * Parameters schema for PUT /api/webhooks/logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksLogsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksLogsUpdateParams = z.infer<typeof ApiWebhooksLogsUpdateParamsSchema>
/**
 * Request schema for PATCH /api/webhooks/logs/{id}/
 */
export const ApiWebhooksLogsPartialUpdateRequestSchema = WebhookEventLogSchema
export type ApiWebhooksLogsPartialUpdateRequest = z.infer<typeof ApiWebhooksLogsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /api/webhooks/logs/{id}/
 * Status: 200
 * 
 */
export const ApiWebhooksLogsPartialUpdateResponseSchema = WebhookEventLogSchema

export type ApiWebhooksLogsPartialUpdateResponse = z.infer<typeof ApiWebhooksLogsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /api/webhooks/logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksLogsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksLogsPartialUpdateParams = z.infer<typeof ApiWebhooksLogsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /api/webhooks/logs/{id}/
 * Status: 204
 * 
 */
export const ApiWebhooksLogsDeleteResponseSchema = z.void()

export type ApiWebhooksLogsDeleteResponse = z.infer<typeof ApiWebhooksLogsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /api/webhooks/logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ApiWebhooksLogsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ApiWebhooksLogsDeleteParams = z.infer<typeof ApiWebhooksLogsDeleteParamsSchema>
/**
 * Success response schema for GET /audit-logs/
 * Status: 200
 * 
 */
export const AuditLogsListResponseSchema = z.array(AuditLogSchema)

export type AuditLogsListResponse = z.infer<typeof AuditLogsListResponseSchema>
/**
 * Parameters schema for GET /audit-logs/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const AuditLogsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type AuditLogsListParams = z.infer<typeof AuditLogsListParamsSchema>
/**
 * Request schema for POST /audit-logs/
 */
export const AuditLogsCreateRequestSchema = AuditLogSchema
export type AuditLogsCreateRequest = z.infer<typeof AuditLogsCreateRequestSchema>
/**
 * Success response schema for POST /audit-logs/
 * Status: 201
 * 
 */
export const AuditLogsCreateResponseSchema = AuditLogSchema

export type AuditLogsCreateResponse = z.infer<typeof AuditLogsCreateResponseSchema>
/**
 * Success response schema for GET /audit-logs/{id}/
 * Status: 200
 * 
 */
export const AuditLogsReadResponseSchema = AuditLogSchema

export type AuditLogsReadResponse = z.infer<typeof AuditLogsReadResponseSchema>
/**
 * Parameters schema for GET /audit-logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuditLogsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuditLogsReadParams = z.infer<typeof AuditLogsReadParamsSchema>
/**
 * Request schema for PUT /audit-logs/{id}/
 */
export const AuditLogsUpdateRequestSchema = AuditLogSchema
export type AuditLogsUpdateRequest = z.infer<typeof AuditLogsUpdateRequestSchema>
/**
 * Success response schema for PUT /audit-logs/{id}/
 * Status: 200
 * 
 */
export const AuditLogsUpdateResponseSchema = AuditLogSchema

export type AuditLogsUpdateResponse = z.infer<typeof AuditLogsUpdateResponseSchema>
/**
 * Parameters schema for PUT /audit-logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuditLogsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuditLogsUpdateParams = z.infer<typeof AuditLogsUpdateParamsSchema>
/**
 * Request schema for PATCH /audit-logs/{id}/
 */
export const AuditLogsPartialUpdateRequestSchema = AuditLogSchema
export type AuditLogsPartialUpdateRequest = z.infer<typeof AuditLogsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /audit-logs/{id}/
 * Status: 200
 * 
 */
export const AuditLogsPartialUpdateResponseSchema = AuditLogSchema

export type AuditLogsPartialUpdateResponse = z.infer<typeof AuditLogsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /audit-logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuditLogsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuditLogsPartialUpdateParams = z.infer<typeof AuditLogsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /audit-logs/{id}/
 * Status: 204
 * 
 */
export const AuditLogsDeleteResponseSchema = z.void()

export type AuditLogsDeleteResponse = z.infer<typeof AuditLogsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /audit-logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuditLogsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuditLogsDeleteParams = z.infer<typeof AuditLogsDeleteParamsSchema>
/**
 * Request schema for POST /auth/jwt/create/
 */
export const AuthJwtCreateCreateRequestSchema = TokenObtainPairSchema
export type AuthJwtCreateCreateRequest = z.infer<typeof AuthJwtCreateCreateRequestSchema>
/**
 * Success response schema for POST /auth/jwt/create/
 * Status: 201
 * 
 */
export const AuthJwtCreateCreateResponseSchema = TokenObtainPairSchema

export type AuthJwtCreateCreateResponse = z.infer<typeof AuthJwtCreateCreateResponseSchema>
/**
 * Request schema for POST /auth/jwt/refresh/
 */
export const AuthJwtRefreshCreateRequestSchema = TokenRefreshSchema
export type AuthJwtRefreshCreateRequest = z.infer<typeof AuthJwtRefreshCreateRequestSchema>
/**
 * Success response schema for POST /auth/jwt/refresh/
 * Status: 201
 * 
 */
export const AuthJwtRefreshCreateResponseSchema = TokenRefreshSchema

export type AuthJwtRefreshCreateResponse = z.infer<typeof AuthJwtRefreshCreateResponseSchema>
/**
 * Request schema for POST /auth/jwt/verify/
 */
export const AuthJwtVerifyCreateRequestSchema = TokenVerifySchema
export type AuthJwtVerifyCreateRequest = z.infer<typeof AuthJwtVerifyCreateRequestSchema>
/**
 * Success response schema for POST /auth/jwt/verify/
 * Status: 201
 * 
 */
export const AuthJwtVerifyCreateResponseSchema = TokenVerifySchema

export type AuthJwtVerifyCreateResponse = z.infer<typeof AuthJwtVerifyCreateResponseSchema>
/**
 * Success response schema for GET /auth/social/o/{provider}/
 * Status: 200
 * 
 */
export const AuthSocialOReadResponseSchema = ProviderAuthSchema

export type AuthSocialOReadResponse = z.infer<typeof AuthSocialOReadResponseSchema>
/**
 * Parameters schema for GET /auth/social/o/{provider}/
 * Path params: provider
 * Query params: none
 * Header params: none
 */
export const AuthSocialOReadParamsSchema = z.object({
  path: z.object({
    provider: z.string()
  })
})

export type AuthSocialOReadParams = z.infer<typeof AuthSocialOReadParamsSchema>
/**
 * Request schema for POST /auth/social/o/{provider}/
 */
export const AuthSocialOCreateRequestSchema = ProviderAuthSchema
export type AuthSocialOCreateRequest = z.infer<typeof AuthSocialOCreateRequestSchema>
/**
 * Success response schema for POST /auth/social/o/{provider}/
 * Status: 201
 * 
 */
export const AuthSocialOCreateResponseSchema = ProviderAuthSchema

export type AuthSocialOCreateResponse = z.infer<typeof AuthSocialOCreateResponseSchema>
/**
 * Parameters schema for POST /auth/social/o/{provider}/
 * Path params: provider
 * Query params: none
 * Header params: none
 */
export const AuthSocialOCreateParamsSchema = z.object({
  path: z.object({
    provider: z.string()
  })
})

export type AuthSocialOCreateParams = z.infer<typeof AuthSocialOCreateParamsSchema>
/**
 * Success response schema for GET /auth/users/
 * Status: 200
 * 
 */
export const AuthUsersListResponseSchema = z.array(UserPublicSchema)

export type AuthUsersListResponse = z.infer<typeof AuthUsersListResponseSchema>
/**
 * Success response schema for POST /auth/users/
 * Status: 201
 * 
 */
export const AuthUsersCreateResponseSchema = z.void()

export type AuthUsersCreateResponse = z.infer<typeof AuthUsersCreateResponseSchema>
/**
 * Request schema for POST /auth/users/activation/
 */
export const AuthUsersActivationRequestSchema = ActivationSchema
export type AuthUsersActivationRequest = z.infer<typeof AuthUsersActivationRequestSchema>
/**
 * Success response schema for POST /auth/users/activation/
 * Status: 201
 * 
 */
export const AuthUsersActivationResponseSchema = ActivationSchema

export type AuthUsersActivationResponse = z.infer<typeof AuthUsersActivationResponseSchema>
/**
 * Success response schema for GET /auth/users/me/
 * Status: 200
 * 
 */
export const AuthUsersMeReadResponseSchema = z.array(UserPublicSchema)

export type AuthUsersMeReadResponse = z.infer<typeof AuthUsersMeReadResponseSchema>
/**
 * Request schema for PUT /auth/users/me/
 */
export const AuthUsersMeUpdateRequestSchema = UserPublicSchema
export type AuthUsersMeUpdateRequest = z.infer<typeof AuthUsersMeUpdateRequestSchema>
/**
 * Success response schema for PUT /auth/users/me/
 * Status: 200
 * 
 */
export const AuthUsersMeUpdateResponseSchema = UserPublicSchema

export type AuthUsersMeUpdateResponse = z.infer<typeof AuthUsersMeUpdateResponseSchema>
/**
 * Request schema for PATCH /auth/users/me/
 */
export const AuthUsersMePartialUpdateRequestSchema = UserPublicSchema
export type AuthUsersMePartialUpdateRequest = z.infer<typeof AuthUsersMePartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /auth/users/me/
 * Status: 200
 * 
 */
export const AuthUsersMePartialUpdateResponseSchema = UserPublicSchema

export type AuthUsersMePartialUpdateResponse = z.infer<typeof AuthUsersMePartialUpdateResponseSchema>
/**
 * Success response schema for DELETE /auth/users/me/
 * Status: 204
 * 
 */
export const AuthUsersMeDeleteResponseSchema = z.void()

export type AuthUsersMeDeleteResponse = z.infer<typeof AuthUsersMeDeleteResponseSchema>
/**
 * Request schema for POST /auth/users/resend_activation/
 */
export const AuthUsersResendActivationRequestSchema = SendEmailResetSchema
export type AuthUsersResendActivationRequest = z.infer<typeof AuthUsersResendActivationRequestSchema>
/**
 * Success response schema for POST /auth/users/resend_activation/
 * Status: 201
 * 
 */
export const AuthUsersResendActivationResponseSchema = SendEmailResetSchema

export type AuthUsersResendActivationResponse = z.infer<typeof AuthUsersResendActivationResponseSchema>
/**
 * Request schema for POST /auth/users/reset_email/
 */
export const AuthUsersResetUsernameRequestSchema = SendEmailResetSchema
export type AuthUsersResetUsernameRequest = z.infer<typeof AuthUsersResetUsernameRequestSchema>
/**
 * Success response schema for POST /auth/users/reset_email/
 * Status: 201
 * 
 */
export const AuthUsersResetUsernameResponseSchema = SendEmailResetSchema

export type AuthUsersResetUsernameResponse = z.infer<typeof AuthUsersResetUsernameResponseSchema>
/**
 * Request schema for POST /auth/users/reset_email_confirm/
 */
export const AuthUsersResetUsernameConfirmRequestSchema = UsernameResetConfirmSchema
export type AuthUsersResetUsernameConfirmRequest = z.infer<typeof AuthUsersResetUsernameConfirmRequestSchema>
/**
 * Success response schema for POST /auth/users/reset_email_confirm/
 * Status: 201
 * 
 */
export const AuthUsersResetUsernameConfirmResponseSchema = UsernameResetConfirmSchema

export type AuthUsersResetUsernameConfirmResponse = z.infer<typeof AuthUsersResetUsernameConfirmResponseSchema>
/**
 * Request schema for POST /auth/users/reset_password/
 */
export const AuthUsersResetPasswordRequestSchema = SendEmailResetSchema
export type AuthUsersResetPasswordRequest = z.infer<typeof AuthUsersResetPasswordRequestSchema>
/**
 * Success response schema for POST /auth/users/reset_password/
 * Status: 201
 * 
 */
export const AuthUsersResetPasswordResponseSchema = SendEmailResetSchema

export type AuthUsersResetPasswordResponse = z.infer<typeof AuthUsersResetPasswordResponseSchema>
/**
 * Request schema for POST /auth/users/reset_password_confirm/
 */
export const AuthUsersResetPasswordConfirmRequestSchema = PasswordResetConfirmRetypeSchema
export type AuthUsersResetPasswordConfirmRequest = z.infer<typeof AuthUsersResetPasswordConfirmRequestSchema>
/**
 * Success response schema for POST /auth/users/reset_password_confirm/
 * Status: 201
 * 
 */
export const AuthUsersResetPasswordConfirmResponseSchema = PasswordResetConfirmRetypeSchema

export type AuthUsersResetPasswordConfirmResponse = z.infer<typeof AuthUsersResetPasswordConfirmResponseSchema>
/**
 * Request schema for POST /auth/users/set_email/
 */
export const AuthUsersSetUsernameRequestSchema = SetUsernameSchema
export type AuthUsersSetUsernameRequest = z.infer<typeof AuthUsersSetUsernameRequestSchema>
/**
 * Success response schema for POST /auth/users/set_email/
 * Status: 201
 * 
 */
export const AuthUsersSetUsernameResponseSchema = SetUsernameSchema

export type AuthUsersSetUsernameResponse = z.infer<typeof AuthUsersSetUsernameResponseSchema>
/**
 * Request schema for POST /auth/users/set_password/
 */
export const AuthUsersSetPasswordRequestSchema = SetPasswordSchema
export type AuthUsersSetPasswordRequest = z.infer<typeof AuthUsersSetPasswordRequestSchema>
/**
 * Success response schema for POST /auth/users/set_password/
 * Status: 201
 * 
 */
export const AuthUsersSetPasswordResponseSchema = SetPasswordSchema

export type AuthUsersSetPasswordResponse = z.infer<typeof AuthUsersSetPasswordResponseSchema>
/**
 * Success response schema for GET /auth/users/{id}/
 * Status: 200
 * 
 */
export const AuthUsersReadResponseSchema = UserPublicSchema

export type AuthUsersReadResponse = z.infer<typeof AuthUsersReadResponseSchema>
/**
 * Parameters schema for GET /auth/users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuthUsersReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuthUsersReadParams = z.infer<typeof AuthUsersReadParamsSchema>
/**
 * Request schema for PUT /auth/users/{id}/
 */
export const AuthUsersUpdateRequestSchema = UserPublicSchema
export type AuthUsersUpdateRequest = z.infer<typeof AuthUsersUpdateRequestSchema>
/**
 * Success response schema for PUT /auth/users/{id}/
 * Status: 200
 * 
 */
export const AuthUsersUpdateResponseSchema = UserPublicSchema

export type AuthUsersUpdateResponse = z.infer<typeof AuthUsersUpdateResponseSchema>
/**
 * Parameters schema for PUT /auth/users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuthUsersUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuthUsersUpdateParams = z.infer<typeof AuthUsersUpdateParamsSchema>
/**
 * Request schema for PATCH /auth/users/{id}/
 */
export const AuthUsersPartialUpdateRequestSchema = UserPublicSchema
export type AuthUsersPartialUpdateRequest = z.infer<typeof AuthUsersPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /auth/users/{id}/
 * Status: 200
 * 
 */
export const AuthUsersPartialUpdateResponseSchema = UserPublicSchema

export type AuthUsersPartialUpdateResponse = z.infer<typeof AuthUsersPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /auth/users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuthUsersPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuthUsersPartialUpdateParams = z.infer<typeof AuthUsersPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /auth/users/{id}/
 * Status: 204
 * 
 */
export const AuthUsersDeleteResponseSchema = z.void()

export type AuthUsersDeleteResponse = z.infer<typeof AuthUsersDeleteResponseSchema>
/**
 * Parameters schema for DELETE /auth/users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const AuthUsersDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type AuthUsersDeleteParams = z.infer<typeof AuthUsersDeleteParamsSchema>
/**
 * Success response schema for GET /branches/
 * Status: 200
 * 
 */
export const BranchesListResponseSchema = z.array(BranchSchema)

export type BranchesListResponse = z.infer<typeof BranchesListResponseSchema>
/**
 * Parameters schema for GET /branches/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const BranchesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type BranchesListParams = z.infer<typeof BranchesListParamsSchema>
/**
 * Request schema for POST /branches/
 */
export const BranchesCreateRequestSchema = BranchSchema
export type BranchesCreateRequest = z.infer<typeof BranchesCreateRequestSchema>
/**
 * Success response schema for POST /branches/
 * Status: 201
 * 
 */
export const BranchesCreateResponseSchema = BranchSchema

export type BranchesCreateResponse = z.infer<typeof BranchesCreateResponseSchema>
/**
 * Success response schema for GET /branches/{id}/
 * Status: 200
 * 
 */
export const BranchesReadResponseSchema = BranchSchema

export type BranchesReadResponse = z.infer<typeof BranchesReadResponseSchema>
/**
 * Parameters schema for GET /branches/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BranchesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BranchesReadParams = z.infer<typeof BranchesReadParamsSchema>
/**
 * Request schema for PUT /branches/{id}/
 */
export const BranchesUpdateRequestSchema = BranchSchema
export type BranchesUpdateRequest = z.infer<typeof BranchesUpdateRequestSchema>
/**
 * Success response schema for PUT /branches/{id}/
 * Status: 200
 * 
 */
export const BranchesUpdateResponseSchema = BranchSchema

export type BranchesUpdateResponse = z.infer<typeof BranchesUpdateResponseSchema>
/**
 * Parameters schema for PUT /branches/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BranchesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BranchesUpdateParams = z.infer<typeof BranchesUpdateParamsSchema>
/**
 * Request schema for PATCH /branches/{id}/
 */
export const BranchesPartialUpdateRequestSchema = BranchSchema
export type BranchesPartialUpdateRequest = z.infer<typeof BranchesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /branches/{id}/
 * Status: 200
 * 
 */
export const BranchesPartialUpdateResponseSchema = BranchSchema

export type BranchesPartialUpdateResponse = z.infer<typeof BranchesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /branches/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BranchesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BranchesPartialUpdateParams = z.infer<typeof BranchesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /branches/{id}/
 * Status: 204
 * 
 */
export const BranchesDeleteResponseSchema = z.void()

export type BranchesDeleteResponse = z.infer<typeof BranchesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /branches/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BranchesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BranchesDeleteParams = z.infer<typeof BranchesDeleteParamsSchema>
/**
 * Success response schema for GET /budgets/
 * Status: 200
 * 
 */
export const BudgetsListResponseSchema = z.array(BudgetSchema)

export type BudgetsListResponse = z.infer<typeof BudgetsListResponseSchema>
/**
 * Request schema for POST /budgets/
 */
export const BudgetsCreateRequestSchema = BudgetSchema
export type BudgetsCreateRequest = z.infer<typeof BudgetsCreateRequestSchema>
/**
 * Success response schema for POST /budgets/
 * Status: 201
 * 
 */
export const BudgetsCreateResponseSchema = BudgetSchema

export type BudgetsCreateResponse = z.infer<typeof BudgetsCreateResponseSchema>
/**
 * Success response schema for GET /budgets/{id}/
 * Status: 200
 * 
 */
export const BudgetsReadResponseSchema = BudgetSchema

export type BudgetsReadResponse = z.infer<typeof BudgetsReadResponseSchema>
/**
 * Parameters schema for GET /budgets/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BudgetsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BudgetsReadParams = z.infer<typeof BudgetsReadParamsSchema>
/**
 * Request schema for PUT /budgets/{id}/
 */
export const BudgetsUpdateRequestSchema = BudgetSchema
export type BudgetsUpdateRequest = z.infer<typeof BudgetsUpdateRequestSchema>
/**
 * Success response schema for PUT /budgets/{id}/
 * Status: 200
 * 
 */
export const BudgetsUpdateResponseSchema = BudgetSchema

export type BudgetsUpdateResponse = z.infer<typeof BudgetsUpdateResponseSchema>
/**
 * Parameters schema for PUT /budgets/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BudgetsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BudgetsUpdateParams = z.infer<typeof BudgetsUpdateParamsSchema>
/**
 * Request schema for PATCH /budgets/{id}/
 */
export const BudgetsPartialUpdateRequestSchema = BudgetSchema
export type BudgetsPartialUpdateRequest = z.infer<typeof BudgetsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /budgets/{id}/
 * Status: 200
 * 
 */
export const BudgetsPartialUpdateResponseSchema = BudgetSchema

export type BudgetsPartialUpdateResponse = z.infer<typeof BudgetsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /budgets/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BudgetsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BudgetsPartialUpdateParams = z.infer<typeof BudgetsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /budgets/{id}/
 * Status: 204
 * 
 */
export const BudgetsDeleteResponseSchema = z.void()

export type BudgetsDeleteResponse = z.infer<typeof BudgetsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /budgets/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const BudgetsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type BudgetsDeleteParams = z.infer<typeof BudgetsDeleteParamsSchema>
/**
 * Success response schema for GET /campaigns/
 * Status: 200
 * 
 */
export const CampaignsListResponseSchema = z.array(CampaignSchema)

export type CampaignsListResponse = z.infer<typeof CampaignsListResponseSchema>
/**
 * Parameters schema for GET /campaigns/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const CampaignsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type CampaignsListParams = z.infer<typeof CampaignsListParamsSchema>
/**
 * Request schema for POST /campaigns/
 */
export const CampaignsCreateRequestSchema = CampaignSchema
export type CampaignsCreateRequest = z.infer<typeof CampaignsCreateRequestSchema>
/**
 * Success response schema for POST /campaigns/
 * Status: 201
 * 
 */
export const CampaignsCreateResponseSchema = CampaignSchema

export type CampaignsCreateResponse = z.infer<typeof CampaignsCreateResponseSchema>
/**
 * Success response schema for GET /campaigns/{id}/
 * Status: 200
 * 
 */
export const CampaignsReadResponseSchema = CampaignSchema

export type CampaignsReadResponse = z.infer<typeof CampaignsReadResponseSchema>
/**
 * Parameters schema for GET /campaigns/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsReadParams = z.infer<typeof CampaignsReadParamsSchema>
/**
 * Request schema for PUT /campaigns/{id}/
 */
export const CampaignsUpdateRequestSchema = CampaignSchema
export type CampaignsUpdateRequest = z.infer<typeof CampaignsUpdateRequestSchema>
/**
 * Success response schema for PUT /campaigns/{id}/
 * Status: 200
 * 
 */
export const CampaignsUpdateResponseSchema = CampaignSchema

export type CampaignsUpdateResponse = z.infer<typeof CampaignsUpdateResponseSchema>
/**
 * Parameters schema for PUT /campaigns/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsUpdateParams = z.infer<typeof CampaignsUpdateParamsSchema>
/**
 * Request schema for PATCH /campaigns/{id}/
 */
export const CampaignsPartialUpdateRequestSchema = CampaignSchema
export type CampaignsPartialUpdateRequest = z.infer<typeof CampaignsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /campaigns/{id}/
 * Status: 200
 * 
 */
export const CampaignsPartialUpdateResponseSchema = CampaignSchema

export type CampaignsPartialUpdateResponse = z.infer<typeof CampaignsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /campaigns/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsPartialUpdateParams = z.infer<typeof CampaignsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /campaigns/{id}/
 * Status: 204
 * 
 */
export const CampaignsDeleteResponseSchema = z.void()

export type CampaignsDeleteResponse = z.infer<typeof CampaignsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /campaigns/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsDeleteParams = z.infer<typeof CampaignsDeleteParamsSchema>
/**
 * Request schema for POST /campaigns/{id}/track_click/
 */
export const CampaignsTrackClickRequestSchema = CampaignSchema
export type CampaignsTrackClickRequest = z.infer<typeof CampaignsTrackClickRequestSchema>
/**
 * Success response schema for POST /campaigns/{id}/track_click/
 * Status: 201
 * 
 */
export const CampaignsTrackClickResponseSchema = CampaignSchema

export type CampaignsTrackClickResponse = z.infer<typeof CampaignsTrackClickResponseSchema>
/**
 * Parameters schema for POST /campaigns/{id}/track_click/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsTrackClickParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsTrackClickParams = z.infer<typeof CampaignsTrackClickParamsSchema>
/**
 * Request schema for POST /campaigns/{id}/track_conversion/
 */
export const CampaignsTrackConversionRequestSchema = CampaignSchema
export type CampaignsTrackConversionRequest = z.infer<typeof CampaignsTrackConversionRequestSchema>
/**
 * Success response schema for POST /campaigns/{id}/track_conversion/
 * Status: 201
 * 
 */
export const CampaignsTrackConversionResponseSchema = CampaignSchema

export type CampaignsTrackConversionResponse = z.infer<typeof CampaignsTrackConversionResponseSchema>
/**
 * Parameters schema for POST /campaigns/{id}/track_conversion/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsTrackConversionParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsTrackConversionParams = z.infer<typeof CampaignsTrackConversionParamsSchema>
/**
 * Request schema for POST /campaigns/{id}/track_impression/
 */
export const CampaignsTrackImpressionRequestSchema = CampaignSchema
export type CampaignsTrackImpressionRequest = z.infer<typeof CampaignsTrackImpressionRequestSchema>
/**
 * Success response schema for POST /campaigns/{id}/track_impression/
 * Status: 201
 * 
 */
export const CampaignsTrackImpressionResponseSchema = CampaignSchema

export type CampaignsTrackImpressionResponse = z.infer<typeof CampaignsTrackImpressionResponseSchema>
/**
 * Parameters schema for POST /campaigns/{id}/track_impression/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CampaignsTrackImpressionParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CampaignsTrackImpressionParams = z.infer<typeof CampaignsTrackImpressionParamsSchema>
/**
 * Success response schema for GET /companies/
 * Status: 200
 * 
 */
export const CompaniesListResponseSchema = z.array(CompanySchema)

export type CompaniesListResponse = z.infer<typeof CompaniesListResponseSchema>
/**
 * Parameters schema for GET /companies/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const CompaniesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type CompaniesListParams = z.infer<typeof CompaniesListParamsSchema>
/**
 * Request schema for POST /companies/
 */
export const CompaniesCreateRequestSchema = CompanySchema
export type CompaniesCreateRequest = z.infer<typeof CompaniesCreateRequestSchema>
/**
 * Success response schema for POST /companies/
 * Status: 201
 * 
 */
export const CompaniesCreateResponseSchema = CompanySchema

export type CompaniesCreateResponse = z.infer<typeof CompaniesCreateResponseSchema>
/**
 * Success response schema for GET /companies/{id}/
 * Status: 200
 * 
 */
export const CompaniesReadResponseSchema = CompanySchema

export type CompaniesReadResponse = z.infer<typeof CompaniesReadResponseSchema>
/**
 * Parameters schema for GET /companies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CompaniesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CompaniesReadParams = z.infer<typeof CompaniesReadParamsSchema>
/**
 * Request schema for PUT /companies/{id}/
 */
export const CompaniesUpdateRequestSchema = CompanySchema
export type CompaniesUpdateRequest = z.infer<typeof CompaniesUpdateRequestSchema>
/**
 * Success response schema for PUT /companies/{id}/
 * Status: 200
 * 
 */
export const CompaniesUpdateResponseSchema = CompanySchema

export type CompaniesUpdateResponse = z.infer<typeof CompaniesUpdateResponseSchema>
/**
 * Parameters schema for PUT /companies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CompaniesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CompaniesUpdateParams = z.infer<typeof CompaniesUpdateParamsSchema>
/**
 * Request schema for PATCH /companies/{id}/
 */
export const CompaniesPartialUpdateRequestSchema = CompanySchema
export type CompaniesPartialUpdateRequest = z.infer<typeof CompaniesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /companies/{id}/
 * Status: 200
 * 
 */
export const CompaniesPartialUpdateResponseSchema = CompanySchema

export type CompaniesPartialUpdateResponse = z.infer<typeof CompaniesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /companies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CompaniesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CompaniesPartialUpdateParams = z.infer<typeof CompaniesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /companies/{id}/
 * Status: 204
 * 
 */
export const CompaniesDeleteResponseSchema = z.void()

export type CompaniesDeleteResponse = z.infer<typeof CompaniesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /companies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CompaniesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CompaniesDeleteParams = z.infer<typeof CompaniesDeleteParamsSchema>
/**
 * Success response schema for GET /cost-centers/
 * Status: 200
 * 
 */
export const CostCentersListResponseSchema = z.array(CostCenterSchema)

export type CostCentersListResponse = z.infer<typeof CostCentersListResponseSchema>
/**
 * Request schema for POST /cost-centers/
 */
export const CostCentersCreateRequestSchema = CostCenterSchema
export type CostCentersCreateRequest = z.infer<typeof CostCentersCreateRequestSchema>
/**
 * Success response schema for POST /cost-centers/
 * Status: 201
 * 
 */
export const CostCentersCreateResponseSchema = CostCenterSchema

export type CostCentersCreateResponse = z.infer<typeof CostCentersCreateResponseSchema>
/**
 * Success response schema for GET /cost-centers/{id}/
 * Status: 200
 * 
 */
export const CostCentersReadResponseSchema = CostCenterSchema

export type CostCentersReadResponse = z.infer<typeof CostCentersReadResponseSchema>
/**
 * Parameters schema for GET /cost-centers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CostCentersReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CostCentersReadParams = z.infer<typeof CostCentersReadParamsSchema>
/**
 * Request schema for PUT /cost-centers/{id}/
 */
export const CostCentersUpdateRequestSchema = CostCenterSchema
export type CostCentersUpdateRequest = z.infer<typeof CostCentersUpdateRequestSchema>
/**
 * Success response schema for PUT /cost-centers/{id}/
 * Status: 200
 * 
 */
export const CostCentersUpdateResponseSchema = CostCenterSchema

export type CostCentersUpdateResponse = z.infer<typeof CostCentersUpdateResponseSchema>
/**
 * Parameters schema for PUT /cost-centers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CostCentersUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CostCentersUpdateParams = z.infer<typeof CostCentersUpdateParamsSchema>
/**
 * Request schema for PATCH /cost-centers/{id}/
 */
export const CostCentersPartialUpdateRequestSchema = CostCenterSchema
export type CostCentersPartialUpdateRequest = z.infer<typeof CostCentersPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /cost-centers/{id}/
 * Status: 200
 * 
 */
export const CostCentersPartialUpdateResponseSchema = CostCenterSchema

export type CostCentersPartialUpdateResponse = z.infer<typeof CostCentersPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /cost-centers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CostCentersPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CostCentersPartialUpdateParams = z.infer<typeof CostCentersPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /cost-centers/{id}/
 * Status: 204
 * 
 */
export const CostCentersDeleteResponseSchema = z.void()

export type CostCentersDeleteResponse = z.infer<typeof CostCentersDeleteResponseSchema>
/**
 * Parameters schema for DELETE /cost-centers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CostCentersDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CostCentersDeleteParams = z.infer<typeof CostCentersDeleteParamsSchema>
/**
 * Success response schema for GET /coupons/
 * Status: 200
 * 
 */
export const CouponsListResponseSchema = z.array(CouponSchema)

export type CouponsListResponse = z.infer<typeof CouponsListResponseSchema>
/**
 * Parameters schema for GET /coupons/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const CouponsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type CouponsListParams = z.infer<typeof CouponsListParamsSchema>
/**
 * Request schema for POST /coupons/
 */
export const CouponsCreateRequestSchema = CouponSchema
export type CouponsCreateRequest = z.infer<typeof CouponsCreateRequestSchema>
/**
 * Success response schema for POST /coupons/
 * Status: 201
 * 
 */
export const CouponsCreateResponseSchema = CouponSchema

export type CouponsCreateResponse = z.infer<typeof CouponsCreateResponseSchema>
/**
 * Success response schema for GET /coupons/{id}/
 * Status: 200
 * 
 */
export const CouponsReadResponseSchema = CouponSchema

export type CouponsReadResponse = z.infer<typeof CouponsReadResponseSchema>
/**
 * Parameters schema for GET /coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CouponsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CouponsReadParams = z.infer<typeof CouponsReadParamsSchema>
/**
 * Request schema for PUT /coupons/{id}/
 */
export const CouponsUpdateRequestSchema = CouponSchema
export type CouponsUpdateRequest = z.infer<typeof CouponsUpdateRequestSchema>
/**
 * Success response schema for PUT /coupons/{id}/
 * Status: 200
 * 
 */
export const CouponsUpdateResponseSchema = CouponSchema

export type CouponsUpdateResponse = z.infer<typeof CouponsUpdateResponseSchema>
/**
 * Parameters schema for PUT /coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CouponsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CouponsUpdateParams = z.infer<typeof CouponsUpdateParamsSchema>
/**
 * Request schema for PATCH /coupons/{id}/
 */
export const CouponsPartialUpdateRequestSchema = CouponSchema
export type CouponsPartialUpdateRequest = z.infer<typeof CouponsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /coupons/{id}/
 * Status: 200
 * 
 */
export const CouponsPartialUpdateResponseSchema = CouponSchema

export type CouponsPartialUpdateResponse = z.infer<typeof CouponsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CouponsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CouponsPartialUpdateParams = z.infer<typeof CouponsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /coupons/{id}/
 * Status: 204
 * 
 */
export const CouponsDeleteResponseSchema = z.void()

export type CouponsDeleteResponse = z.infer<typeof CouponsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CouponsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CouponsDeleteParams = z.infer<typeof CouponsDeleteParamsSchema>
/**
 * Request schema for POST /coupons/{id}/apply/
 */
export const CouponsApplyRequestSchema = CouponSchema
export type CouponsApplyRequest = z.infer<typeof CouponsApplyRequestSchema>
/**
 * Success response schema for POST /coupons/{id}/apply/
 * Status: 201
 * 
 */
export const CouponsApplyResponseSchema = CouponSchema

export type CouponsApplyResponse = z.infer<typeof CouponsApplyResponseSchema>
/**
 * Parameters schema for POST /coupons/{id}/apply/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CouponsApplyParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CouponsApplyParams = z.infer<typeof CouponsApplyParamsSchema>
/**
 * Success response schema for GET /currencies/
 * Status: 200
 * 
 */
export const CurrenciesListResponseSchema = z.array(CurrencySchema)

export type CurrenciesListResponse = z.infer<typeof CurrenciesListResponseSchema>
/**
 * Request schema for POST /currencies/
 */
export const CurrenciesCreateRequestSchema = CurrencySchema
export type CurrenciesCreateRequest = z.infer<typeof CurrenciesCreateRequestSchema>
/**
 * Success response schema for POST /currencies/
 * Status: 201
 * 
 */
export const CurrenciesCreateResponseSchema = CurrencySchema

export type CurrenciesCreateResponse = z.infer<typeof CurrenciesCreateResponseSchema>
/**
 * Success response schema for GET /currencies/{id}/
 * Status: 200
 * 
 */
export const CurrenciesReadResponseSchema = CurrencySchema

export type CurrenciesReadResponse = z.infer<typeof CurrenciesReadResponseSchema>
/**
 * Parameters schema for GET /currencies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CurrenciesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CurrenciesReadParams = z.infer<typeof CurrenciesReadParamsSchema>
/**
 * Request schema for PUT /currencies/{id}/
 */
export const CurrenciesUpdateRequestSchema = CurrencySchema
export type CurrenciesUpdateRequest = z.infer<typeof CurrenciesUpdateRequestSchema>
/**
 * Success response schema for PUT /currencies/{id}/
 * Status: 200
 * 
 */
export const CurrenciesUpdateResponseSchema = CurrencySchema

export type CurrenciesUpdateResponse = z.infer<typeof CurrenciesUpdateResponseSchema>
/**
 * Parameters schema for PUT /currencies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CurrenciesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CurrenciesUpdateParams = z.infer<typeof CurrenciesUpdateParamsSchema>
/**
 * Request schema for PATCH /currencies/{id}/
 */
export const CurrenciesPartialUpdateRequestSchema = CurrencySchema
export type CurrenciesPartialUpdateRequest = z.infer<typeof CurrenciesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /currencies/{id}/
 * Status: 200
 * 
 */
export const CurrenciesPartialUpdateResponseSchema = CurrencySchema

export type CurrenciesPartialUpdateResponse = z.infer<typeof CurrenciesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /currencies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CurrenciesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CurrenciesPartialUpdateParams = z.infer<typeof CurrenciesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /currencies/{id}/
 * Status: 204
 * 
 */
export const CurrenciesDeleteResponseSchema = z.void()

export type CurrenciesDeleteResponse = z.infer<typeof CurrenciesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /currencies/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CurrenciesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CurrenciesDeleteParams = z.infer<typeof CurrenciesDeleteParamsSchema>
/**
 * Success response schema for GET /currency-history/
 * Status: 200
 * 
 */
export const CurrencyHistoryListResponseSchema = z.array(CurrencyHistorySchema)

export type CurrencyHistoryListResponse = z.infer<typeof CurrencyHistoryListResponseSchema>
/**
 * Success response schema for GET /currency-history/{id}/
 * Status: 200
 * 
 */
export const CurrencyHistoryReadResponseSchema = CurrencyHistorySchema

export type CurrencyHistoryReadResponse = z.infer<typeof CurrencyHistoryReadResponseSchema>
/**
 * Parameters schema for GET /currency-history/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const CurrencyHistoryReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type CurrencyHistoryReadParams = z.infer<typeof CurrencyHistoryReadParamsSchema>
/**
 * Success response schema for GET /inventory-balances/
 * Status: 200
 * 
 */
export const InventoryBalancesListResponseSchema = z.array(InventoryBalanceSchema)

export type InventoryBalancesListResponse = z.infer<typeof InventoryBalancesListResponseSchema>
/**
 * Parameters schema for GET /inventory-balances/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const InventoryBalancesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type InventoryBalancesListParams = z.infer<typeof InventoryBalancesListParamsSchema>
/**
 * Request schema for POST /inventory-balances/
 */
export const InventoryBalancesCreateRequestSchema = InventoryBalanceSchema
export type InventoryBalancesCreateRequest = z.infer<typeof InventoryBalancesCreateRequestSchema>
/**
 * Success response schema for POST /inventory-balances/
 * Status: 201
 * 
 */
export const InventoryBalancesCreateResponseSchema = InventoryBalanceSchema

export type InventoryBalancesCreateResponse = z.infer<typeof InventoryBalancesCreateResponseSchema>
/**
 * Success response schema for GET /inventory-balances/{id}/
 * Status: 200
 * 
 */
export const InventoryBalancesReadResponseSchema = InventoryBalanceSchema

export type InventoryBalancesReadResponse = z.infer<typeof InventoryBalancesReadResponseSchema>
/**
 * Parameters schema for GET /inventory-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const InventoryBalancesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type InventoryBalancesReadParams = z.infer<typeof InventoryBalancesReadParamsSchema>
/**
 * Request schema for PUT /inventory-balances/{id}/
 */
export const InventoryBalancesUpdateRequestSchema = InventoryBalanceSchema
export type InventoryBalancesUpdateRequest = z.infer<typeof InventoryBalancesUpdateRequestSchema>
/**
 * Success response schema for PUT /inventory-balances/{id}/
 * Status: 200
 * 
 */
export const InventoryBalancesUpdateResponseSchema = InventoryBalanceSchema

export type InventoryBalancesUpdateResponse = z.infer<typeof InventoryBalancesUpdateResponseSchema>
/**
 * Parameters schema for PUT /inventory-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const InventoryBalancesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type InventoryBalancesUpdateParams = z.infer<typeof InventoryBalancesUpdateParamsSchema>
/**
 * Request schema for PATCH /inventory-balances/{id}/
 */
export const InventoryBalancesPartialUpdateRequestSchema = InventoryBalanceSchema
export type InventoryBalancesPartialUpdateRequest = z.infer<typeof InventoryBalancesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /inventory-balances/{id}/
 * Status: 200
 * 
 */
export const InventoryBalancesPartialUpdateResponseSchema = InventoryBalanceSchema

export type InventoryBalancesPartialUpdateResponse = z.infer<typeof InventoryBalancesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /inventory-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const InventoryBalancesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type InventoryBalancesPartialUpdateParams = z.infer<typeof InventoryBalancesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /inventory-balances/{id}/
 * Status: 204
 * 
 */
export const InventoryBalancesDeleteResponseSchema = z.void()

export type InventoryBalancesDeleteResponse = z.infer<typeof InventoryBalancesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /inventory-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const InventoryBalancesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type InventoryBalancesDeleteParams = z.infer<typeof InventoryBalancesDeleteParamsSchema>
/**
 * Success response schema for GET /item-barcodes/
 * Status: 200
 * 
 */
export const ItemBarcodesListResponseSchema = z.array(ItemBarcodeSchema)

export type ItemBarcodesListResponse = z.infer<typeof ItemBarcodesListResponseSchema>
/**
 * Parameters schema for GET /item-barcodes/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ItemBarcodesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ItemBarcodesListParams = z.infer<typeof ItemBarcodesListParamsSchema>
/**
 * Request schema for POST /item-barcodes/
 */
export const ItemBarcodesCreateRequestSchema = ItemBarcodeSchema
export type ItemBarcodesCreateRequest = z.infer<typeof ItemBarcodesCreateRequestSchema>
/**
 * Success response schema for POST /item-barcodes/
 * Status: 201
 * 
 */
export const ItemBarcodesCreateResponseSchema = ItemBarcodeSchema

export type ItemBarcodesCreateResponse = z.infer<typeof ItemBarcodesCreateResponseSchema>
/**
 * Success response schema for GET /item-barcodes/{id}/
 * Status: 200
 * 
 */
export const ItemBarcodesReadResponseSchema = ItemBarcodeSchema

export type ItemBarcodesReadResponse = z.infer<typeof ItemBarcodesReadResponseSchema>
/**
 * Parameters schema for GET /item-barcodes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemBarcodesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemBarcodesReadParams = z.infer<typeof ItemBarcodesReadParamsSchema>
/**
 * Request schema for PUT /item-barcodes/{id}/
 */
export const ItemBarcodesUpdateRequestSchema = ItemBarcodeSchema
export type ItemBarcodesUpdateRequest = z.infer<typeof ItemBarcodesUpdateRequestSchema>
/**
 * Success response schema for PUT /item-barcodes/{id}/
 * Status: 200
 * 
 */
export const ItemBarcodesUpdateResponseSchema = ItemBarcodeSchema

export type ItemBarcodesUpdateResponse = z.infer<typeof ItemBarcodesUpdateResponseSchema>
/**
 * Parameters schema for PUT /item-barcodes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemBarcodesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemBarcodesUpdateParams = z.infer<typeof ItemBarcodesUpdateParamsSchema>
/**
 * Request schema for PATCH /item-barcodes/{id}/
 */
export const ItemBarcodesPartialUpdateRequestSchema = ItemBarcodeSchema
export type ItemBarcodesPartialUpdateRequest = z.infer<typeof ItemBarcodesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /item-barcodes/{id}/
 * Status: 200
 * 
 */
export const ItemBarcodesPartialUpdateResponseSchema = ItemBarcodeSchema

export type ItemBarcodesPartialUpdateResponse = z.infer<typeof ItemBarcodesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /item-barcodes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemBarcodesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemBarcodesPartialUpdateParams = z.infer<typeof ItemBarcodesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /item-barcodes/{id}/
 * Status: 204
 * 
 */
export const ItemBarcodesDeleteResponseSchema = z.void()

export type ItemBarcodesDeleteResponse = z.infer<typeof ItemBarcodesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /item-barcodes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemBarcodesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemBarcodesDeleteParams = z.infer<typeof ItemBarcodesDeleteParamsSchema>
/**
 * Success response schema for GET /item-groups/
 * Status: 200
 * 
 */
export const ItemGroupsListResponseSchema = z.array(ItemGroupSchema)

export type ItemGroupsListResponse = z.infer<typeof ItemGroupsListResponseSchema>
/**
 * Parameters schema for GET /item-groups/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ItemGroupsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ItemGroupsListParams = z.infer<typeof ItemGroupsListParamsSchema>
/**
 * Request schema for POST /item-groups/
 */
export const ItemGroupsCreateRequestSchema = ItemGroupSchema
export type ItemGroupsCreateRequest = z.infer<typeof ItemGroupsCreateRequestSchema>
/**
 * Success response schema for POST /item-groups/
 * Status: 201
 * 
 */
export const ItemGroupsCreateResponseSchema = ItemGroupSchema

export type ItemGroupsCreateResponse = z.infer<typeof ItemGroupsCreateResponseSchema>
/**
 * Success response schema for GET /item-groups/{id}/
 * Status: 200
 * 
 */
export const ItemGroupsReadResponseSchema = ItemGroupSchema

export type ItemGroupsReadResponse = z.infer<typeof ItemGroupsReadResponseSchema>
/**
 * Parameters schema for GET /item-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemGroupsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemGroupsReadParams = z.infer<typeof ItemGroupsReadParamsSchema>
/**
 * Request schema for PUT /item-groups/{id}/
 */
export const ItemGroupsUpdateRequestSchema = ItemGroupSchema
export type ItemGroupsUpdateRequest = z.infer<typeof ItemGroupsUpdateRequestSchema>
/**
 * Success response schema for PUT /item-groups/{id}/
 * Status: 200
 * 
 */
export const ItemGroupsUpdateResponseSchema = ItemGroupSchema

export type ItemGroupsUpdateResponse = z.infer<typeof ItemGroupsUpdateResponseSchema>
/**
 * Parameters schema for PUT /item-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemGroupsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemGroupsUpdateParams = z.infer<typeof ItemGroupsUpdateParamsSchema>
/**
 * Request schema for PATCH /item-groups/{id}/
 */
export const ItemGroupsPartialUpdateRequestSchema = ItemGroupSchema
export type ItemGroupsPartialUpdateRequest = z.infer<typeof ItemGroupsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /item-groups/{id}/
 * Status: 200
 * 
 */
export const ItemGroupsPartialUpdateResponseSchema = ItemGroupSchema

export type ItemGroupsPartialUpdateResponse = z.infer<typeof ItemGroupsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /item-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemGroupsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemGroupsPartialUpdateParams = z.infer<typeof ItemGroupsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /item-groups/{id}/
 * Status: 204
 * 
 */
export const ItemGroupsDeleteResponseSchema = z.void()

export type ItemGroupsDeleteResponse = z.infer<typeof ItemGroupsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /item-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemGroupsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemGroupsDeleteParams = z.infer<typeof ItemGroupsDeleteParamsSchema>
/**
 * Success response schema for GET /item-units/
 * Status: 200
 * 
 */
export const ItemUnitsListResponseSchema = z.array(ItemUnitSchema)

export type ItemUnitsListResponse = z.infer<typeof ItemUnitsListResponseSchema>
/**
 * Parameters schema for GET /item-units/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ItemUnitsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ItemUnitsListParams = z.infer<typeof ItemUnitsListParamsSchema>
/**
 * Request schema for POST /item-units/
 */
export const ItemUnitsCreateRequestSchema = ItemUnitSchema
export type ItemUnitsCreateRequest = z.infer<typeof ItemUnitsCreateRequestSchema>
/**
 * Success response schema for POST /item-units/
 * Status: 201
 * 
 */
export const ItemUnitsCreateResponseSchema = ItemUnitSchema

export type ItemUnitsCreateResponse = z.infer<typeof ItemUnitsCreateResponseSchema>
/**
 * Success response schema for GET /item-units/{id}/
 * Status: 200
 * 
 */
export const ItemUnitsReadResponseSchema = ItemUnitSchema

export type ItemUnitsReadResponse = z.infer<typeof ItemUnitsReadResponseSchema>
/**
 * Parameters schema for GET /item-units/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemUnitsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemUnitsReadParams = z.infer<typeof ItemUnitsReadParamsSchema>
/**
 * Request schema for PUT /item-units/{id}/
 */
export const ItemUnitsUpdateRequestSchema = ItemUnitSchema
export type ItemUnitsUpdateRequest = z.infer<typeof ItemUnitsUpdateRequestSchema>
/**
 * Success response schema for PUT /item-units/{id}/
 * Status: 200
 * 
 */
export const ItemUnitsUpdateResponseSchema = ItemUnitSchema

export type ItemUnitsUpdateResponse = z.infer<typeof ItemUnitsUpdateResponseSchema>
/**
 * Parameters schema for PUT /item-units/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemUnitsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemUnitsUpdateParams = z.infer<typeof ItemUnitsUpdateParamsSchema>
/**
 * Request schema for PATCH /item-units/{id}/
 */
export const ItemUnitsPartialUpdateRequestSchema = ItemUnitSchema
export type ItemUnitsPartialUpdateRequest = z.infer<typeof ItemUnitsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /item-units/{id}/
 * Status: 200
 * 
 */
export const ItemUnitsPartialUpdateResponseSchema = ItemUnitSchema

export type ItemUnitsPartialUpdateResponse = z.infer<typeof ItemUnitsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /item-units/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemUnitsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemUnitsPartialUpdateParams = z.infer<typeof ItemUnitsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /item-units/{id}/
 * Status: 204
 * 
 */
export const ItemUnitsDeleteResponseSchema = z.void()

export type ItemUnitsDeleteResponse = z.infer<typeof ItemUnitsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /item-units/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemUnitsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemUnitsDeleteParams = z.infer<typeof ItemUnitsDeleteParamsSchema>
/**
 * Success response schema for GET /items/
 * Status: 200
 * 
 */
export const ItemsListResponseSchema = z.array(ItemSchema)

export type ItemsListResponse = z.infer<typeof ItemsListResponseSchema>
/**
 * Parameters schema for GET /items/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ItemsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ItemsListParams = z.infer<typeof ItemsListParamsSchema>
/**
 * Request schema for POST /items/
 */
export const ItemsCreateRequestSchema = ItemSchema
export type ItemsCreateRequest = z.infer<typeof ItemsCreateRequestSchema>
/**
 * Success response schema for POST /items/
 * Status: 201
 * 
 */
export const ItemsCreateResponseSchema = ItemSchema

export type ItemsCreateResponse = z.infer<typeof ItemsCreateResponseSchema>
/**
 * Success response schema for GET /items/{id}/
 * Status: 200
 * 
 */
export const ItemsReadResponseSchema = ItemSchema

export type ItemsReadResponse = z.infer<typeof ItemsReadResponseSchema>
/**
 * Parameters schema for GET /items/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemsReadParams = z.infer<typeof ItemsReadParamsSchema>
/**
 * Request schema for PUT /items/{id}/
 */
export const ItemsUpdateRequestSchema = ItemSchema
export type ItemsUpdateRequest = z.infer<typeof ItemsUpdateRequestSchema>
/**
 * Success response schema for PUT /items/{id}/
 * Status: 200
 * 
 */
export const ItemsUpdateResponseSchema = ItemSchema

export type ItemsUpdateResponse = z.infer<typeof ItemsUpdateResponseSchema>
/**
 * Parameters schema for PUT /items/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemsUpdateParams = z.infer<typeof ItemsUpdateParamsSchema>
/**
 * Request schema for PATCH /items/{id}/
 */
export const ItemsPartialUpdateRequestSchema = ItemSchema
export type ItemsPartialUpdateRequest = z.infer<typeof ItemsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /items/{id}/
 * Status: 200
 * 
 */
export const ItemsPartialUpdateResponseSchema = ItemSchema

export type ItemsPartialUpdateResponse = z.infer<typeof ItemsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /items/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemsPartialUpdateParams = z.infer<typeof ItemsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /items/{id}/
 * Status: 204
 * 
 */
export const ItemsDeleteResponseSchema = z.void()

export type ItemsDeleteResponse = z.infer<typeof ItemsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /items/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ItemsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ItemsDeleteParams = z.infer<typeof ItemsDeleteParamsSchema>
/**
 * Success response schema for GET /keyboard-shortcuts/
 * Status: 200
 * 
 */
export const KeyboardShortcutsListResponseSchema = z.array(KeyboardShortcutsSchema)

export type KeyboardShortcutsListResponse = z.infer<typeof KeyboardShortcutsListResponseSchema>
/**
 * Parameters schema for GET /keyboard-shortcuts/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const KeyboardShortcutsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type KeyboardShortcutsListParams = z.infer<typeof KeyboardShortcutsListParamsSchema>
/**
 * Request schema for POST /keyboard-shortcuts/
 */
export const KeyboardShortcutsCreateRequestSchema = KeyboardShortcutsSchema
export type KeyboardShortcutsCreateRequest = z.infer<typeof KeyboardShortcutsCreateRequestSchema>
/**
 * Success response schema for POST /keyboard-shortcuts/
 * Status: 201
 * 
 */
export const KeyboardShortcutsCreateResponseSchema = KeyboardShortcutsSchema

export type KeyboardShortcutsCreateResponse = z.infer<typeof KeyboardShortcutsCreateResponseSchema>
/**
 * Success response schema for GET /keyboard-shortcuts/{id}/
 * Status: 200
 * 
 */
export const KeyboardShortcutsReadResponseSchema = KeyboardShortcutsSchema

export type KeyboardShortcutsReadResponse = z.infer<typeof KeyboardShortcutsReadResponseSchema>
/**
 * Parameters schema for GET /keyboard-shortcuts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const KeyboardShortcutsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type KeyboardShortcutsReadParams = z.infer<typeof KeyboardShortcutsReadParamsSchema>
/**
 * Request schema for PUT /keyboard-shortcuts/{id}/
 */
export const KeyboardShortcutsUpdateRequestSchema = KeyboardShortcutsSchema
export type KeyboardShortcutsUpdateRequest = z.infer<typeof KeyboardShortcutsUpdateRequestSchema>
/**
 * Success response schema for PUT /keyboard-shortcuts/{id}/
 * Status: 200
 * 
 */
export const KeyboardShortcutsUpdateResponseSchema = KeyboardShortcutsSchema

export type KeyboardShortcutsUpdateResponse = z.infer<typeof KeyboardShortcutsUpdateResponseSchema>
/**
 * Parameters schema for PUT /keyboard-shortcuts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const KeyboardShortcutsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type KeyboardShortcutsUpdateParams = z.infer<typeof KeyboardShortcutsUpdateParamsSchema>
/**
 * Request schema for PATCH /keyboard-shortcuts/{id}/
 */
export const KeyboardShortcutsPartialUpdateRequestSchema = KeyboardShortcutsSchema
export type KeyboardShortcutsPartialUpdateRequest = z.infer<typeof KeyboardShortcutsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /keyboard-shortcuts/{id}/
 * Status: 200
 * 
 */
export const KeyboardShortcutsPartialUpdateResponseSchema = KeyboardShortcutsSchema

export type KeyboardShortcutsPartialUpdateResponse = z.infer<typeof KeyboardShortcutsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /keyboard-shortcuts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const KeyboardShortcutsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type KeyboardShortcutsPartialUpdateParams = z.infer<typeof KeyboardShortcutsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /keyboard-shortcuts/{id}/
 * Status: 204
 * 
 */
export const KeyboardShortcutsDeleteResponseSchema = z.void()

export type KeyboardShortcutsDeleteResponse = z.infer<typeof KeyboardShortcutsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /keyboard-shortcuts/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const KeyboardShortcutsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type KeyboardShortcutsDeleteParams = z.infer<typeof KeyboardShortcutsDeleteParamsSchema>
/**
 * Success response schema for GET /license-types/
 * Status: 200
 * 
 */
export const LicenseTypesListResponseSchema = z.array(LicenseTypeSchema)

export type LicenseTypesListResponse = z.infer<typeof LicenseTypesListResponseSchema>
/**
 * Parameters schema for GET /license-types/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const LicenseTypesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type LicenseTypesListParams = z.infer<typeof LicenseTypesListParamsSchema>
/**
 * Request schema for POST /license-types/
 */
export const LicenseTypesCreateRequestSchema = LicenseTypeSchema
export type LicenseTypesCreateRequest = z.infer<typeof LicenseTypesCreateRequestSchema>
/**
 * Success response schema for POST /license-types/
 * Status: 201
 * 
 */
export const LicenseTypesCreateResponseSchema = LicenseTypeSchema

export type LicenseTypesCreateResponse = z.infer<typeof LicenseTypesCreateResponseSchema>
/**
 * Success response schema for GET /license-types/{id}/
 * Status: 200
 * 
 */
export const LicenseTypesReadResponseSchema = LicenseTypeSchema

export type LicenseTypesReadResponse = z.infer<typeof LicenseTypesReadResponseSchema>
/**
 * Parameters schema for GET /license-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicenseTypesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicenseTypesReadParams = z.infer<typeof LicenseTypesReadParamsSchema>
/**
 * Request schema for PUT /license-types/{id}/
 */
export const LicenseTypesUpdateRequestSchema = LicenseTypeSchema
export type LicenseTypesUpdateRequest = z.infer<typeof LicenseTypesUpdateRequestSchema>
/**
 * Success response schema for PUT /license-types/{id}/
 * Status: 200
 * 
 */
export const LicenseTypesUpdateResponseSchema = LicenseTypeSchema

export type LicenseTypesUpdateResponse = z.infer<typeof LicenseTypesUpdateResponseSchema>
/**
 * Parameters schema for PUT /license-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicenseTypesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicenseTypesUpdateParams = z.infer<typeof LicenseTypesUpdateParamsSchema>
/**
 * Request schema for PATCH /license-types/{id}/
 */
export const LicenseTypesPartialUpdateRequestSchema = LicenseTypeSchema
export type LicenseTypesPartialUpdateRequest = z.infer<typeof LicenseTypesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /license-types/{id}/
 * Status: 200
 * 
 */
export const LicenseTypesPartialUpdateResponseSchema = LicenseTypeSchema

export type LicenseTypesPartialUpdateResponse = z.infer<typeof LicenseTypesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /license-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicenseTypesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicenseTypesPartialUpdateParams = z.infer<typeof LicenseTypesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /license-types/{id}/
 * Status: 204
 * 
 */
export const LicenseTypesDeleteResponseSchema = z.void()

export type LicenseTypesDeleteResponse = z.infer<typeof LicenseTypesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /license-types/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicenseTypesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicenseTypesDeleteParams = z.infer<typeof LicenseTypesDeleteParamsSchema>
/**
 * Success response schema for GET /licenses/
 * Status: 200
 * 
 */
export const LicensesListResponseSchema = z.array(LicenseSchema)

export type LicensesListResponse = z.infer<typeof LicensesListResponseSchema>
/**
 * Parameters schema for GET /licenses/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const LicensesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type LicensesListParams = z.infer<typeof LicensesListParamsSchema>
/**
 * Request schema for POST /licenses/
 */
export const LicensesCreateRequestSchema = LicenseSchema
export type LicensesCreateRequest = z.infer<typeof LicensesCreateRequestSchema>
/**
 * Success response schema for POST /licenses/
 * Status: 201
 * 
 */
export const LicensesCreateResponseSchema = LicenseSchema

export type LicensesCreateResponse = z.infer<typeof LicensesCreateResponseSchema>
/**
 * Success response schema for GET /licenses/{id}/
 * Status: 200
 * 
 */
export const LicensesReadResponseSchema = LicenseSchema

export type LicensesReadResponse = z.infer<typeof LicensesReadResponseSchema>
/**
 * Parameters schema for GET /licenses/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicensesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicensesReadParams = z.infer<typeof LicensesReadParamsSchema>
/**
 * Request schema for PUT /licenses/{id}/
 */
export const LicensesUpdateRequestSchema = LicenseSchema
export type LicensesUpdateRequest = z.infer<typeof LicensesUpdateRequestSchema>
/**
 * Success response schema for PUT /licenses/{id}/
 * Status: 200
 * 
 */
export const LicensesUpdateResponseSchema = LicenseSchema

export type LicensesUpdateResponse = z.infer<typeof LicensesUpdateResponseSchema>
/**
 * Parameters schema for PUT /licenses/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicensesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicensesUpdateParams = z.infer<typeof LicensesUpdateParamsSchema>
/**
 * Request schema for PATCH /licenses/{id}/
 */
export const LicensesPartialUpdateRequestSchema = LicenseSchema
export type LicensesPartialUpdateRequest = z.infer<typeof LicensesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /licenses/{id}/
 * Status: 200
 * 
 */
export const LicensesPartialUpdateResponseSchema = LicenseSchema

export type LicensesPartialUpdateResponse = z.infer<typeof LicensesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /licenses/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicensesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicensesPartialUpdateParams = z.infer<typeof LicensesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /licenses/{id}/
 * Status: 204
 * 
 */
export const LicensesDeleteResponseSchema = z.void()

export type LicensesDeleteResponse = z.infer<typeof LicensesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /licenses/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicensesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicensesDeleteParams = z.infer<typeof LicensesDeleteParamsSchema>
/**
 * Request schema for POST /licenses/{id}/validate/
 */
export const LicensesValidateRequestSchema = LicenseSchema
export type LicensesValidateRequest = z.infer<typeof LicensesValidateRequestSchema>
/**
 * Success response schema for POST /licenses/{id}/validate/
 * Status: 201
 * 
 */
export const LicensesValidateResponseSchema = LicenseSchema

export type LicensesValidateResponse = z.infer<typeof LicensesValidateResponseSchema>
/**
 * Parameters schema for POST /licenses/{id}/validate/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LicensesValidateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LicensesValidateParams = z.infer<typeof LicensesValidateParamsSchema>
/**
 * Success response schema for GET /logs/
 * Status: 200
 * 
 */
export const LogsListResponseSchema = z.array(NotificationLogSchema)

export type LogsListResponse = z.infer<typeof LogsListResponseSchema>
/**
 * Parameters schema for GET /logs/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const LogsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type LogsListParams = z.infer<typeof LogsListParamsSchema>
/**
 * Success response schema for GET /logs/{id}/
 * Status: 200
 * 
 */
export const LogsReadResponseSchema = NotificationLogSchema

export type LogsReadResponse = z.infer<typeof LogsReadResponseSchema>
/**
 * Parameters schema for GET /logs/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const LogsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type LogsReadParams = z.infer<typeof LogsReadParamsSchema>
/**
 * Success response schema for GET /messages/
 * Status: 200
 * 
 */
export const MessagesListResponseSchema = z.array(InternalMessageSchema)

export type MessagesListResponse = z.infer<typeof MessagesListResponseSchema>
/**
 * Parameters schema for GET /messages/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const MessagesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type MessagesListParams = z.infer<typeof MessagesListParamsSchema>
/**
 * Request schema for POST /messages/
 */
export const MessagesCreateRequestSchema = InternalMessageSchema
export type MessagesCreateRequest = z.infer<typeof MessagesCreateRequestSchema>
/**
 * Success response schema for POST /messages/
 * Status: 201
 * 
 */
export const MessagesCreateResponseSchema = InternalMessageSchema

export type MessagesCreateResponse = z.infer<typeof MessagesCreateResponseSchema>
/**
 * Success response schema for GET /messages/{id}/
 * Status: 200
 * 
 */
export const MessagesReadResponseSchema = InternalMessageSchema

export type MessagesReadResponse = z.infer<typeof MessagesReadResponseSchema>
/**
 * Parameters schema for GET /messages/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const MessagesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type MessagesReadParams = z.infer<typeof MessagesReadParamsSchema>
/**
 * Request schema for PUT /messages/{id}/
 */
export const MessagesUpdateRequestSchema = InternalMessageSchema
export type MessagesUpdateRequest = z.infer<typeof MessagesUpdateRequestSchema>
/**
 * Success response schema for PUT /messages/{id}/
 * Status: 200
 * 
 */
export const MessagesUpdateResponseSchema = InternalMessageSchema

export type MessagesUpdateResponse = z.infer<typeof MessagesUpdateResponseSchema>
/**
 * Parameters schema for PUT /messages/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const MessagesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type MessagesUpdateParams = z.infer<typeof MessagesUpdateParamsSchema>
/**
 * Request schema for PATCH /messages/{id}/
 */
export const MessagesPartialUpdateRequestSchema = InternalMessageSchema
export type MessagesPartialUpdateRequest = z.infer<typeof MessagesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /messages/{id}/
 * Status: 200
 * 
 */
export const MessagesPartialUpdateResponseSchema = InternalMessageSchema

export type MessagesPartialUpdateResponse = z.infer<typeof MessagesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /messages/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const MessagesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type MessagesPartialUpdateParams = z.infer<typeof MessagesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /messages/{id}/
 * Status: 204
 * 
 */
export const MessagesDeleteResponseSchema = z.void()

export type MessagesDeleteResponse = z.infer<typeof MessagesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /messages/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const MessagesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type MessagesDeleteParams = z.infer<typeof MessagesDeleteParamsSchema>
/**
 * Request schema for POST /messages/{id}/mark_as_read/
 */
export const MessagesMarkAsReadRequestSchema = InternalMessageSchema
export type MessagesMarkAsReadRequest = z.infer<typeof MessagesMarkAsReadRequestSchema>
/**
 * Success response schema for POST /messages/{id}/mark_as_read/
 * Status: 201
 * 
 */
export const MessagesMarkAsReadResponseSchema = InternalMessageSchema

export type MessagesMarkAsReadResponse = z.infer<typeof MessagesMarkAsReadResponseSchema>
/**
 * Parameters schema for POST /messages/{id}/mark_as_read/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const MessagesMarkAsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type MessagesMarkAsReadParams = z.infer<typeof MessagesMarkAsReadParamsSchema>
/**
 * Success response schema for GET /notes/
 * Status: 200
 * 
 */
export const NotesListResponseSchema = z.array(UserNoteSchema)

export type NotesListResponse = z.infer<typeof NotesListResponseSchema>
/**
 * Parameters schema for GET /notes/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const NotesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type NotesListParams = z.infer<typeof NotesListParamsSchema>
/**
 * Request schema for POST /notes/
 */
export const NotesCreateRequestSchema = UserNoteSchema
export type NotesCreateRequest = z.infer<typeof NotesCreateRequestSchema>
/**
 * Success response schema for POST /notes/
 * Status: 201
 * 
 */
export const NotesCreateResponseSchema = UserNoteSchema

export type NotesCreateResponse = z.infer<typeof NotesCreateResponseSchema>
/**
 * Success response schema for GET /notes/{id}/
 * Status: 200
 * 
 */
export const NotesReadResponseSchema = UserNoteSchema

export type NotesReadResponse = z.infer<typeof NotesReadResponseSchema>
/**
 * Parameters schema for GET /notes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotesReadParams = z.infer<typeof NotesReadParamsSchema>
/**
 * Request schema for PUT /notes/{id}/
 */
export const NotesUpdateRequestSchema = UserNoteSchema
export type NotesUpdateRequest = z.infer<typeof NotesUpdateRequestSchema>
/**
 * Success response schema for PUT /notes/{id}/
 * Status: 200
 * 
 */
export const NotesUpdateResponseSchema = UserNoteSchema

export type NotesUpdateResponse = z.infer<typeof NotesUpdateResponseSchema>
/**
 * Parameters schema for PUT /notes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotesUpdateParams = z.infer<typeof NotesUpdateParamsSchema>
/**
 * Request schema for PATCH /notes/{id}/
 */
export const NotesPartialUpdateRequestSchema = UserNoteSchema
export type NotesPartialUpdateRequest = z.infer<typeof NotesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /notes/{id}/
 * Status: 200
 * 
 */
export const NotesPartialUpdateResponseSchema = UserNoteSchema

export type NotesPartialUpdateResponse = z.infer<typeof NotesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /notes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotesPartialUpdateParams = z.infer<typeof NotesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /notes/{id}/
 * Status: 204
 * 
 */
export const NotesDeleteResponseSchema = z.void()

export type NotesDeleteResponse = z.infer<typeof NotesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /notes/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotesDeleteParams = z.infer<typeof NotesDeleteParamsSchema>
/**
 * Request schema for POST /notes/{id}/mark_reminder_sent/
 */
export const NotesMarkReminderSentRequestSchema = UserNoteSchema
export type NotesMarkReminderSentRequest = z.infer<typeof NotesMarkReminderSentRequestSchema>
/**
 * Success response schema for POST /notes/{id}/mark_reminder_sent/
 * Status: 201
 * 
 */
export const NotesMarkReminderSentResponseSchema = UserNoteSchema

export type NotesMarkReminderSentResponse = z.infer<typeof NotesMarkReminderSentResponseSchema>
/**
 * Parameters schema for POST /notes/{id}/mark_reminder_sent/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotesMarkReminderSentParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotesMarkReminderSentParams = z.infer<typeof NotesMarkReminderSentParamsSchema>
/**
 * Success response schema for GET /notifications/
 * Status: 200
 * 
 */
export const NotificationsListResponseSchema = z.array(NotificationSchema)

export type NotificationsListResponse = z.infer<typeof NotificationsListResponseSchema>
/**
 * Parameters schema for GET /notifications/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const NotificationsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type NotificationsListParams = z.infer<typeof NotificationsListParamsSchema>
/**
 * Request schema for POST /notifications/
 */
export const NotificationsCreateRequestSchema = NotificationSchema
export type NotificationsCreateRequest = z.infer<typeof NotificationsCreateRequestSchema>
/**
 * Success response schema for POST /notifications/
 * Status: 201
 * 
 */
export const NotificationsCreateResponseSchema = NotificationSchema

export type NotificationsCreateResponse = z.infer<typeof NotificationsCreateResponseSchema>
/**
 * Success response schema for GET /notifications/{id}/
 * Status: 200
 * 
 */
export const NotificationsReadResponseSchema = NotificationSchema

export type NotificationsReadResponse = z.infer<typeof NotificationsReadResponseSchema>
/**
 * Parameters schema for GET /notifications/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotificationsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotificationsReadParams = z.infer<typeof NotificationsReadParamsSchema>
/**
 * Request schema for PUT /notifications/{id}/
 */
export const NotificationsUpdateRequestSchema = NotificationSchema
export type NotificationsUpdateRequest = z.infer<typeof NotificationsUpdateRequestSchema>
/**
 * Success response schema for PUT /notifications/{id}/
 * Status: 200
 * 
 */
export const NotificationsUpdateResponseSchema = NotificationSchema

export type NotificationsUpdateResponse = z.infer<typeof NotificationsUpdateResponseSchema>
/**
 * Parameters schema for PUT /notifications/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotificationsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotificationsUpdateParams = z.infer<typeof NotificationsUpdateParamsSchema>
/**
 * Request schema for PATCH /notifications/{id}/
 */
export const NotificationsPartialUpdateRequestSchema = NotificationSchema
export type NotificationsPartialUpdateRequest = z.infer<typeof NotificationsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /notifications/{id}/
 * Status: 200
 * 
 */
export const NotificationsPartialUpdateResponseSchema = NotificationSchema

export type NotificationsPartialUpdateResponse = z.infer<typeof NotificationsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /notifications/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotificationsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotificationsPartialUpdateParams = z.infer<typeof NotificationsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /notifications/{id}/
 * Status: 204
 * 
 */
export const NotificationsDeleteResponseSchema = z.void()

export type NotificationsDeleteResponse = z.infer<typeof NotificationsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /notifications/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotificationsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotificationsDeleteParams = z.infer<typeof NotificationsDeleteParamsSchema>
/**
 * Request schema for POST /notifications/{id}/mark_as_read/
 */
export const NotificationsMarkAsReadRequestSchema = NotificationSchema
export type NotificationsMarkAsReadRequest = z.infer<typeof NotificationsMarkAsReadRequestSchema>
/**
 * Success response schema for POST /notifications/{id}/mark_as_read/
 * Status: 201
 * 
 */
export const NotificationsMarkAsReadResponseSchema = NotificationSchema

export type NotificationsMarkAsReadResponse = z.infer<typeof NotificationsMarkAsReadResponseSchema>
/**
 * Parameters schema for POST /notifications/{id}/mark_as_read/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const NotificationsMarkAsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type NotificationsMarkAsReadParams = z.infer<typeof NotificationsMarkAsReadParamsSchema>
/**
 * Success response schema for GET /offers/
 * Status: 200
 * 
 */
export const OffersListResponseSchema = z.array(OfferSchema)

export type OffersListResponse = z.infer<typeof OffersListResponseSchema>
/**
 * Parameters schema for GET /offers/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const OffersListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type OffersListParams = z.infer<typeof OffersListParamsSchema>
/**
 * Request schema for POST /offers/
 */
export const OffersCreateRequestSchema = OfferSchema
export type OffersCreateRequest = z.infer<typeof OffersCreateRequestSchema>
/**
 * Success response schema for POST /offers/
 * Status: 201
 * 
 */
export const OffersCreateResponseSchema = OfferSchema

export type OffersCreateResponse = z.infer<typeof OffersCreateResponseSchema>
/**
 * Success response schema for GET /offers/{id}/
 * Status: 200
 * 
 */
export const OffersReadResponseSchema = OfferSchema

export type OffersReadResponse = z.infer<typeof OffersReadResponseSchema>
/**
 * Parameters schema for GET /offers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OffersReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OffersReadParams = z.infer<typeof OffersReadParamsSchema>
/**
 * Request schema for PUT /offers/{id}/
 */
export const OffersUpdateRequestSchema = OfferSchema
export type OffersUpdateRequest = z.infer<typeof OffersUpdateRequestSchema>
/**
 * Success response schema for PUT /offers/{id}/
 * Status: 200
 * 
 */
export const OffersUpdateResponseSchema = OfferSchema

export type OffersUpdateResponse = z.infer<typeof OffersUpdateResponseSchema>
/**
 * Parameters schema for PUT /offers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OffersUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OffersUpdateParams = z.infer<typeof OffersUpdateParamsSchema>
/**
 * Request schema for PATCH /offers/{id}/
 */
export const OffersPartialUpdateRequestSchema = OfferSchema
export type OffersPartialUpdateRequest = z.infer<typeof OffersPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /offers/{id}/
 * Status: 200
 * 
 */
export const OffersPartialUpdateResponseSchema = OfferSchema

export type OffersPartialUpdateResponse = z.infer<typeof OffersPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /offers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OffersPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OffersPartialUpdateParams = z.infer<typeof OffersPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /offers/{id}/
 * Status: 204
 * 
 */
export const OffersDeleteResponseSchema = z.void()

export type OffersDeleteResponse = z.infer<typeof OffersDeleteResponseSchema>
/**
 * Parameters schema for DELETE /offers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OffersDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OffersDeleteParams = z.infer<typeof OffersDeleteParamsSchema>
/**
 * Request schema for POST /offers/{id}/apply/
 */
export const OffersApplyRequestSchema = OfferSchema
export type OffersApplyRequest = z.infer<typeof OffersApplyRequestSchema>
/**
 * Success response schema for POST /offers/{id}/apply/
 * Status: 201
 * 
 */
export const OffersApplyResponseSchema = OfferSchema

export type OffersApplyResponse = z.infer<typeof OffersApplyResponseSchema>
/**
 * Parameters schema for POST /offers/{id}/apply/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OffersApplyParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OffersApplyParams = z.infer<typeof OffersApplyParamsSchema>
/**
 * Success response schema for GET /opening-balances/
 * Status: 200
 * 
 */
export const OpeningBalancesListResponseSchema = z.array(OpeningBalanceSchema)

export type OpeningBalancesListResponse = z.infer<typeof OpeningBalancesListResponseSchema>
/**
 * Request schema for POST /opening-balances/
 */
export const OpeningBalancesCreateRequestSchema = OpeningBalanceSchema
export type OpeningBalancesCreateRequest = z.infer<typeof OpeningBalancesCreateRequestSchema>
/**
 * Success response schema for POST /opening-balances/
 * Status: 201
 * 
 */
export const OpeningBalancesCreateResponseSchema = OpeningBalanceSchema

export type OpeningBalancesCreateResponse = z.infer<typeof OpeningBalancesCreateResponseSchema>
/**
 * Success response schema for GET /opening-balances/{id}/
 * Status: 200
 * 
 */
export const OpeningBalancesReadResponseSchema = OpeningBalanceSchema

export type OpeningBalancesReadResponse = z.infer<typeof OpeningBalancesReadResponseSchema>
/**
 * Parameters schema for GET /opening-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OpeningBalancesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OpeningBalancesReadParams = z.infer<typeof OpeningBalancesReadParamsSchema>
/**
 * Request schema for PUT /opening-balances/{id}/
 */
export const OpeningBalancesUpdateRequestSchema = OpeningBalanceSchema
export type OpeningBalancesUpdateRequest = z.infer<typeof OpeningBalancesUpdateRequestSchema>
/**
 * Success response schema for PUT /opening-balances/{id}/
 * Status: 200
 * 
 */
export const OpeningBalancesUpdateResponseSchema = OpeningBalanceSchema

export type OpeningBalancesUpdateResponse = z.infer<typeof OpeningBalancesUpdateResponseSchema>
/**
 * Parameters schema for PUT /opening-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OpeningBalancesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OpeningBalancesUpdateParams = z.infer<typeof OpeningBalancesUpdateParamsSchema>
/**
 * Request schema for PATCH /opening-balances/{id}/
 */
export const OpeningBalancesPartialUpdateRequestSchema = OpeningBalanceSchema
export type OpeningBalancesPartialUpdateRequest = z.infer<typeof OpeningBalancesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /opening-balances/{id}/
 * Status: 200
 * 
 */
export const OpeningBalancesPartialUpdateResponseSchema = OpeningBalanceSchema

export type OpeningBalancesPartialUpdateResponse = z.infer<typeof OpeningBalancesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /opening-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OpeningBalancesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OpeningBalancesPartialUpdateParams = z.infer<typeof OpeningBalancesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /opening-balances/{id}/
 * Status: 204
 * 
 */
export const OpeningBalancesDeleteResponseSchema = z.void()

export type OpeningBalancesDeleteResponse = z.infer<typeof OpeningBalancesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /opening-balances/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const OpeningBalancesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type OpeningBalancesDeleteParams = z.infer<typeof OpeningBalancesDeleteParamsSchema>
/**
 * Success response schema for GET /profiles/
 * Status: 200
 * 
 */
export const ProfilesListResponseSchema = z.array(UserProfileSchema)

export type ProfilesListResponse = z.infer<typeof ProfilesListResponseSchema>
/**
 * Parameters schema for GET /profiles/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ProfilesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ProfilesListParams = z.infer<typeof ProfilesListParamsSchema>
/**
 * Request schema for POST /profiles/
 */
export const ProfilesCreateRequestSchema = UserProfileSchema
export type ProfilesCreateRequest = z.infer<typeof ProfilesCreateRequestSchema>
/**
 * Success response schema for POST /profiles/
 * Status: 201
 * 
 */
export const ProfilesCreateResponseSchema = UserProfileSchema

export type ProfilesCreateResponse = z.infer<typeof ProfilesCreateResponseSchema>
/**
 * Success response schema for GET /profiles/{id}/
 * Status: 200
 * 
 */
export const ProfilesReadResponseSchema = UserProfileSchema

export type ProfilesReadResponse = z.infer<typeof ProfilesReadResponseSchema>
/**
 * Parameters schema for GET /profiles/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ProfilesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ProfilesReadParams = z.infer<typeof ProfilesReadParamsSchema>
/**
 * Request schema for PUT /profiles/{id}/
 */
export const ProfilesUpdateRequestSchema = UserProfileSchema
export type ProfilesUpdateRequest = z.infer<typeof ProfilesUpdateRequestSchema>
/**
 * Success response schema for PUT /profiles/{id}/
 * Status: 200
 * 
 */
export const ProfilesUpdateResponseSchema = UserProfileSchema

export type ProfilesUpdateResponse = z.infer<typeof ProfilesUpdateResponseSchema>
/**
 * Parameters schema for PUT /profiles/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ProfilesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ProfilesUpdateParams = z.infer<typeof ProfilesUpdateParamsSchema>
/**
 * Request schema for PATCH /profiles/{id}/
 */
export const ProfilesPartialUpdateRequestSchema = UserProfileSchema
export type ProfilesPartialUpdateRequest = z.infer<typeof ProfilesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /profiles/{id}/
 * Status: 200
 * 
 */
export const ProfilesPartialUpdateResponseSchema = UserProfileSchema

export type ProfilesPartialUpdateResponse = z.infer<typeof ProfilesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /profiles/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ProfilesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ProfilesPartialUpdateParams = z.infer<typeof ProfilesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /profiles/{id}/
 * Status: 204
 * 
 */
export const ProfilesDeleteResponseSchema = z.void()

export type ProfilesDeleteResponse = z.infer<typeof ProfilesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /profiles/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ProfilesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ProfilesDeleteParams = z.infer<typeof ProfilesDeleteParamsSchema>
/**
 * Request schema for POST /profiles/{id}/withdraw_consent/
 */
export const ProfilesWithdrawConsentRequestSchema = UserProfileSchema
export type ProfilesWithdrawConsentRequest = z.infer<typeof ProfilesWithdrawConsentRequestSchema>
/**
 * Success response schema for POST /profiles/{id}/withdraw_consent/
 * Status: 201
 * 
 */
export const ProfilesWithdrawConsentResponseSchema = UserProfileSchema

export type ProfilesWithdrawConsentResponse = z.infer<typeof ProfilesWithdrawConsentResponseSchema>
/**
 * Parameters schema for POST /profiles/{id}/withdraw_consent/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ProfilesWithdrawConsentParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ProfilesWithdrawConsentParams = z.infer<typeof ProfilesWithdrawConsentParamsSchema>
/**
 * Success response schema for GET /reports/
 * Status: 200
 * 
 */
export const ReportsListResponseSchema = z.array(ReportTemplateSchema)

export type ReportsListResponse = z.infer<typeof ReportsListResponseSchema>
/**
 * Parameters schema for GET /reports/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ReportsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ReportsListParams = z.infer<typeof ReportsListParamsSchema>
/**
 * Request schema for POST /reports/
 */
export const ReportsCreateRequestSchema = ReportTemplateSchema
export type ReportsCreateRequest = z.infer<typeof ReportsCreateRequestSchema>
/**
 * Success response schema for POST /reports/
 * Status: 201
 * 
 */
export const ReportsCreateResponseSchema = ReportTemplateSchema

export type ReportsCreateResponse = z.infer<typeof ReportsCreateResponseSchema>
/**
 * Success response schema for GET /reports/available_models/
 * Status: 200
 * 
 */
export const ReportsAvailableModelsResponseSchema = z.array(ReportTemplateSchema)

export type ReportsAvailableModelsResponse = z.infer<typeof ReportsAvailableModelsResponseSchema>
/**
 * Parameters schema for GET /reports/available_models/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const ReportsAvailableModelsParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type ReportsAvailableModelsParams = z.infer<typeof ReportsAvailableModelsParamsSchema>
/**
 * Request schema for POST /reports/validate_query/
 */
export const ReportsValidateQueryRequestSchema = ReportTemplateSchema
export type ReportsValidateQueryRequest = z.infer<typeof ReportsValidateQueryRequestSchema>
/**
 * Success response schema for POST /reports/validate_query/
 * Status: 201
 * 
 */
export const ReportsValidateQueryResponseSchema = ReportTemplateSchema

export type ReportsValidateQueryResponse = z.infer<typeof ReportsValidateQueryResponseSchema>
/**
 * Success response schema for GET /reports/{id}/
 * Status: 200
 * 
 */
export const ReportsReadResponseSchema = ReportTemplateSchema

export type ReportsReadResponse = z.infer<typeof ReportsReadResponseSchema>
/**
 * Parameters schema for GET /reports/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ReportsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ReportsReadParams = z.infer<typeof ReportsReadParamsSchema>
/**
 * Request schema for PUT /reports/{id}/
 */
export const ReportsUpdateRequestSchema = ReportTemplateSchema
export type ReportsUpdateRequest = z.infer<typeof ReportsUpdateRequestSchema>
/**
 * Success response schema for PUT /reports/{id}/
 * Status: 200
 * 
 */
export const ReportsUpdateResponseSchema = ReportTemplateSchema

export type ReportsUpdateResponse = z.infer<typeof ReportsUpdateResponseSchema>
/**
 * Parameters schema for PUT /reports/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ReportsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ReportsUpdateParams = z.infer<typeof ReportsUpdateParamsSchema>
/**
 * Request schema for PATCH /reports/{id}/
 */
export const ReportsPartialUpdateRequestSchema = ReportTemplateSchema
export type ReportsPartialUpdateRequest = z.infer<typeof ReportsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /reports/{id}/
 * Status: 200
 * 
 */
export const ReportsPartialUpdateResponseSchema = ReportTemplateSchema

export type ReportsPartialUpdateResponse = z.infer<typeof ReportsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /reports/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ReportsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ReportsPartialUpdateParams = z.infer<typeof ReportsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /reports/{id}/
 * Status: 204
 * 
 */
export const ReportsDeleteResponseSchema = z.void()

export type ReportsDeleteResponse = z.infer<typeof ReportsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /reports/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ReportsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ReportsDeleteParams = z.infer<typeof ReportsDeleteParamsSchema>
/**
 * Request schema for POST /reports/{id}/execute/
 */
export const ReportsExecuteRequestSchema = ReportTemplateSchema
export type ReportsExecuteRequest = z.infer<typeof ReportsExecuteRequestSchema>
/**
 * Success response schema for POST /reports/{id}/execute/
 * Status: 201
 * 
 */
export const ReportsExecuteResponseSchema = ReportTemplateSchema

export type ReportsExecuteResponse = z.infer<typeof ReportsExecuteResponseSchema>
/**
 * Parameters schema for POST /reports/{id}/execute/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ReportsExecuteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ReportsExecuteParams = z.infer<typeof ReportsExecuteParamsSchema>
/**
 * Success response schema for GET /reports/{id}/preview/
 * Status: 200
 * 
 */
export const ReportsPreviewResponseSchema = ReportTemplateSchema

export type ReportsPreviewResponse = z.infer<typeof ReportsPreviewResponseSchema>
/**
 * Parameters schema for GET /reports/{id}/preview/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const ReportsPreviewParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type ReportsPreviewParams = z.infer<typeof ReportsPreviewParamsSchema>
/**
 * Success response schema for GET /store-groups/
 * Status: 200
 * 
 */
export const StoreGroupsListResponseSchema = z.array(StoreGroupSchema)

export type StoreGroupsListResponse = z.infer<typeof StoreGroupsListResponseSchema>
/**
 * Parameters schema for GET /store-groups/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const StoreGroupsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type StoreGroupsListParams = z.infer<typeof StoreGroupsListParamsSchema>
/**
 * Request schema for POST /store-groups/
 */
export const StoreGroupsCreateRequestSchema = StoreGroupSchema
export type StoreGroupsCreateRequest = z.infer<typeof StoreGroupsCreateRequestSchema>
/**
 * Success response schema for POST /store-groups/
 * Status: 201
 * 
 */
export const StoreGroupsCreateResponseSchema = StoreGroupSchema

export type StoreGroupsCreateResponse = z.infer<typeof StoreGroupsCreateResponseSchema>
/**
 * Success response schema for GET /store-groups/{id}/
 * Status: 200
 * 
 */
export const StoreGroupsReadResponseSchema = StoreGroupSchema

export type StoreGroupsReadResponse = z.infer<typeof StoreGroupsReadResponseSchema>
/**
 * Parameters schema for GET /store-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const StoreGroupsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type StoreGroupsReadParams = z.infer<typeof StoreGroupsReadParamsSchema>
/**
 * Request schema for PUT /store-groups/{id}/
 */
export const StoreGroupsUpdateRequestSchema = StoreGroupSchema
export type StoreGroupsUpdateRequest = z.infer<typeof StoreGroupsUpdateRequestSchema>
/**
 * Success response schema for PUT /store-groups/{id}/
 * Status: 200
 * 
 */
export const StoreGroupsUpdateResponseSchema = StoreGroupSchema

export type StoreGroupsUpdateResponse = z.infer<typeof StoreGroupsUpdateResponseSchema>
/**
 * Parameters schema for PUT /store-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const StoreGroupsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type StoreGroupsUpdateParams = z.infer<typeof StoreGroupsUpdateParamsSchema>
/**
 * Request schema for PATCH /store-groups/{id}/
 */
export const StoreGroupsPartialUpdateRequestSchema = StoreGroupSchema
export type StoreGroupsPartialUpdateRequest = z.infer<typeof StoreGroupsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /store-groups/{id}/
 * Status: 200
 * 
 */
export const StoreGroupsPartialUpdateResponseSchema = StoreGroupSchema

export type StoreGroupsPartialUpdateResponse = z.infer<typeof StoreGroupsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /store-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const StoreGroupsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type StoreGroupsPartialUpdateParams = z.infer<typeof StoreGroupsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /store-groups/{id}/
 * Status: 204
 * 
 */
export const StoreGroupsDeleteResponseSchema = z.void()

export type StoreGroupsDeleteResponse = z.infer<typeof StoreGroupsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /store-groups/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const StoreGroupsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type StoreGroupsDeleteParams = z.infer<typeof StoreGroupsDeleteParamsSchema>
/**
 * Success response schema for GET /subscribers/
 * Status: 200
 * 
 */
export const SubscribersListResponseSchema = z.array(InsuranceSubscriberSchema)

export type SubscribersListResponse = z.infer<typeof SubscribersListResponseSchema>
/**
 * Parameters schema for GET /subscribers/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const SubscribersListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type SubscribersListParams = z.infer<typeof SubscribersListParamsSchema>
/**
 * Request schema for POST /subscribers/
 */
export const SubscribersCreateRequestSchema = InsuranceSubscriberSchema
export type SubscribersCreateRequest = z.infer<typeof SubscribersCreateRequestSchema>
/**
 * Success response schema for POST /subscribers/
 * Status: 201
 * 
 */
export const SubscribersCreateResponseSchema = InsuranceSubscriberSchema

export type SubscribersCreateResponse = z.infer<typeof SubscribersCreateResponseSchema>
/**
 * Success response schema for GET /subscribers/{id}/
 * Status: 200
 * 
 */
export const SubscribersReadResponseSchema = InsuranceSubscriberSchema

export type SubscribersReadResponse = z.infer<typeof SubscribersReadResponseSchema>
/**
 * Parameters schema for GET /subscribers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SubscribersReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SubscribersReadParams = z.infer<typeof SubscribersReadParamsSchema>
/**
 * Request schema for PUT /subscribers/{id}/
 */
export const SubscribersUpdateRequestSchema = InsuranceSubscriberSchema
export type SubscribersUpdateRequest = z.infer<typeof SubscribersUpdateRequestSchema>
/**
 * Success response schema for PUT /subscribers/{id}/
 * Status: 200
 * 
 */
export const SubscribersUpdateResponseSchema = InsuranceSubscriberSchema

export type SubscribersUpdateResponse = z.infer<typeof SubscribersUpdateResponseSchema>
/**
 * Parameters schema for PUT /subscribers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SubscribersUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SubscribersUpdateParams = z.infer<typeof SubscribersUpdateParamsSchema>
/**
 * Request schema for PATCH /subscribers/{id}/
 */
export const SubscribersPartialUpdateRequestSchema = InsuranceSubscriberSchema
export type SubscribersPartialUpdateRequest = z.infer<typeof SubscribersPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /subscribers/{id}/
 * Status: 200
 * 
 */
export const SubscribersPartialUpdateResponseSchema = InsuranceSubscriberSchema

export type SubscribersPartialUpdateResponse = z.infer<typeof SubscribersPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /subscribers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SubscribersPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SubscribersPartialUpdateParams = z.infer<typeof SubscribersPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /subscribers/{id}/
 * Status: 204
 * 
 */
export const SubscribersDeleteResponseSchema = z.void()

export type SubscribersDeleteResponse = z.infer<typeof SubscribersDeleteResponseSchema>
/**
 * Parameters schema for DELETE /subscribers/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SubscribersDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SubscribersDeleteParams = z.infer<typeof SubscribersDeleteParamsSchema>
/**
 * Success response schema for GET /system-settings/
 * Status: 200
 * 
 */
export const SystemSettingsListResponseSchema = z.array(SystemSettingsSchema)

export type SystemSettingsListResponse = z.infer<typeof SystemSettingsListResponseSchema>
/**
 * Parameters schema for GET /system-settings/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const SystemSettingsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type SystemSettingsListParams = z.infer<typeof SystemSettingsListParamsSchema>
/**
 * Request schema for POST /system-settings/
 */
export const SystemSettingsCreateRequestSchema = SystemSettingsSchema
export type SystemSettingsCreateRequest = z.infer<typeof SystemSettingsCreateRequestSchema>
/**
 * Success response schema for POST /system-settings/
 * Status: 201
 * 
 */
export const SystemSettingsCreateResponseSchema = SystemSettingsSchema

export type SystemSettingsCreateResponse = z.infer<typeof SystemSettingsCreateResponseSchema>
/**
 * Success response schema for GET /system-settings/{id}/
 * Status: 200
 * 
 */
export const SystemSettingsReadResponseSchema = SystemSettingsSchema

export type SystemSettingsReadResponse = z.infer<typeof SystemSettingsReadResponseSchema>
/**
 * Parameters schema for GET /system-settings/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SystemSettingsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SystemSettingsReadParams = z.infer<typeof SystemSettingsReadParamsSchema>
/**
 * Request schema for PUT /system-settings/{id}/
 */
export const SystemSettingsUpdateRequestSchema = SystemSettingsSchema
export type SystemSettingsUpdateRequest = z.infer<typeof SystemSettingsUpdateRequestSchema>
/**
 * Success response schema for PUT /system-settings/{id}/
 * Status: 200
 * 
 */
export const SystemSettingsUpdateResponseSchema = SystemSettingsSchema

export type SystemSettingsUpdateResponse = z.infer<typeof SystemSettingsUpdateResponseSchema>
/**
 * Parameters schema for PUT /system-settings/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SystemSettingsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SystemSettingsUpdateParams = z.infer<typeof SystemSettingsUpdateParamsSchema>
/**
 * Request schema for PATCH /system-settings/{id}/
 */
export const SystemSettingsPartialUpdateRequestSchema = SystemSettingsSchema
export type SystemSettingsPartialUpdateRequest = z.infer<typeof SystemSettingsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /system-settings/{id}/
 * Status: 200
 * 
 */
export const SystemSettingsPartialUpdateResponseSchema = SystemSettingsSchema

export type SystemSettingsPartialUpdateResponse = z.infer<typeof SystemSettingsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /system-settings/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SystemSettingsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SystemSettingsPartialUpdateParams = z.infer<typeof SystemSettingsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /system-settings/{id}/
 * Status: 204
 * 
 */
export const SystemSettingsDeleteResponseSchema = z.void()

export type SystemSettingsDeleteResponse = z.infer<typeof SystemSettingsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /system-settings/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const SystemSettingsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type SystemSettingsDeleteParams = z.infer<typeof SystemSettingsDeleteParamsSchema>
/**
 * Success response schema for GET /templates/
 * Status: 200
 * 
 */
export const TemplatesListResponseSchema = z.array(NotificationTemplateSchema)

export type TemplatesListResponse = z.infer<typeof TemplatesListResponseSchema>
/**
 * Parameters schema for GET /templates/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const TemplatesListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type TemplatesListParams = z.infer<typeof TemplatesListParamsSchema>
/**
 * Request schema for POST /templates/
 */
export const TemplatesCreateRequestSchema = NotificationTemplateSchema
export type TemplatesCreateRequest = z.infer<typeof TemplatesCreateRequestSchema>
/**
 * Success response schema for POST /templates/
 * Status: 201
 * 
 */
export const TemplatesCreateResponseSchema = NotificationTemplateSchema

export type TemplatesCreateResponse = z.infer<typeof TemplatesCreateResponseSchema>
/**
 * Success response schema for GET /templates/{id}/
 * Status: 200
 * 
 */
export const TemplatesReadResponseSchema = NotificationTemplateSchema

export type TemplatesReadResponse = z.infer<typeof TemplatesReadResponseSchema>
/**
 * Parameters schema for GET /templates/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const TemplatesReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type TemplatesReadParams = z.infer<typeof TemplatesReadParamsSchema>
/**
 * Request schema for PUT /templates/{id}/
 */
export const TemplatesUpdateRequestSchema = NotificationTemplateSchema
export type TemplatesUpdateRequest = z.infer<typeof TemplatesUpdateRequestSchema>
/**
 * Success response schema for PUT /templates/{id}/
 * Status: 200
 * 
 */
export const TemplatesUpdateResponseSchema = NotificationTemplateSchema

export type TemplatesUpdateResponse = z.infer<typeof TemplatesUpdateResponseSchema>
/**
 * Parameters schema for PUT /templates/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const TemplatesUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type TemplatesUpdateParams = z.infer<typeof TemplatesUpdateParamsSchema>
/**
 * Request schema for PATCH /templates/{id}/
 */
export const TemplatesPartialUpdateRequestSchema = NotificationTemplateSchema
export type TemplatesPartialUpdateRequest = z.infer<typeof TemplatesPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /templates/{id}/
 * Status: 200
 * 
 */
export const TemplatesPartialUpdateResponseSchema = NotificationTemplateSchema

export type TemplatesPartialUpdateResponse = z.infer<typeof TemplatesPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /templates/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const TemplatesPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type TemplatesPartialUpdateParams = z.infer<typeof TemplatesPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /templates/{id}/
 * Status: 204
 * 
 */
export const TemplatesDeleteResponseSchema = z.void()

export type TemplatesDeleteResponse = z.infer<typeof TemplatesDeleteResponseSchema>
/**
 * Parameters schema for DELETE /templates/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const TemplatesDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type TemplatesDeleteParams = z.infer<typeof TemplatesDeleteParamsSchema>
/**
 * Success response schema for GET /user-coupons/
 * Status: 200
 * 
 */
export const UserCouponsListResponseSchema = z.array(UserCouponSchema)

export type UserCouponsListResponse = z.infer<typeof UserCouponsListResponseSchema>
/**
 * Parameters schema for GET /user-coupons/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const UserCouponsListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type UserCouponsListParams = z.infer<typeof UserCouponsListParamsSchema>
/**
 * Request schema for POST /user-coupons/
 */
export const UserCouponsCreateRequestSchema = UserCouponSchema
export type UserCouponsCreateRequest = z.infer<typeof UserCouponsCreateRequestSchema>
/**
 * Success response schema for POST /user-coupons/
 * Status: 201
 * 
 */
export const UserCouponsCreateResponseSchema = UserCouponSchema

export type UserCouponsCreateResponse = z.infer<typeof UserCouponsCreateResponseSchema>
/**
 * Success response schema for GET /user-coupons/{id}/
 * Status: 200
 * 
 */
export const UserCouponsReadResponseSchema = UserCouponSchema

export type UserCouponsReadResponse = z.infer<typeof UserCouponsReadResponseSchema>
/**
 * Parameters schema for GET /user-coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UserCouponsReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UserCouponsReadParams = z.infer<typeof UserCouponsReadParamsSchema>
/**
 * Request schema for PUT /user-coupons/{id}/
 */
export const UserCouponsUpdateRequestSchema = UserCouponSchema
export type UserCouponsUpdateRequest = z.infer<typeof UserCouponsUpdateRequestSchema>
/**
 * Success response schema for PUT /user-coupons/{id}/
 * Status: 200
 * 
 */
export const UserCouponsUpdateResponseSchema = UserCouponSchema

export type UserCouponsUpdateResponse = z.infer<typeof UserCouponsUpdateResponseSchema>
/**
 * Parameters schema for PUT /user-coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UserCouponsUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UserCouponsUpdateParams = z.infer<typeof UserCouponsUpdateParamsSchema>
/**
 * Request schema for PATCH /user-coupons/{id}/
 */
export const UserCouponsPartialUpdateRequestSchema = UserCouponSchema
export type UserCouponsPartialUpdateRequest = z.infer<typeof UserCouponsPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /user-coupons/{id}/
 * Status: 200
 * 
 */
export const UserCouponsPartialUpdateResponseSchema = UserCouponSchema

export type UserCouponsPartialUpdateResponse = z.infer<typeof UserCouponsPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /user-coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UserCouponsPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UserCouponsPartialUpdateParams = z.infer<typeof UserCouponsPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /user-coupons/{id}/
 * Status: 204
 * 
 */
export const UserCouponsDeleteResponseSchema = z.void()

export type UserCouponsDeleteResponse = z.infer<typeof UserCouponsDeleteResponseSchema>
/**
 * Parameters schema for DELETE /user-coupons/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UserCouponsDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UserCouponsDeleteParams = z.infer<typeof UserCouponsDeleteParamsSchema>
/**
 * Success response schema for GET /users/
 * Status: 200
 * 
 */
export const UsersListResponseSchema = z.array(UserPublicSchema)

export type UsersListResponse = z.infer<typeof UsersListResponseSchema>
/**
 * Parameters schema for GET /users/
 * Path params: none
 * Query params: search, ordering
 * Header params: none
 */
export const UsersListParamsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    ordering: z.string().optional()
  }).optional()
})

export type UsersListParams = z.infer<typeof UsersListParamsSchema>
/**
 * Request schema for POST /users/
 */
export const UsersCreateRequestSchema = UserPublicSchema
export type UsersCreateRequest = z.infer<typeof UsersCreateRequestSchema>
/**
 * Success response schema for POST /users/
 * Status: 201
 * 
 */
export const UsersCreateResponseSchema = UserPublicSchema

export type UsersCreateResponse = z.infer<typeof UsersCreateResponseSchema>
/**
 * Success response schema for GET /users/{id}/
 * Status: 200
 * 
 */
export const UsersReadResponseSchema = UserPublicSchema

export type UsersReadResponse = z.infer<typeof UsersReadResponseSchema>
/**
 * Parameters schema for GET /users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UsersReadParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UsersReadParams = z.infer<typeof UsersReadParamsSchema>
/**
 * Request schema for PUT /users/{id}/
 */
export const UsersUpdateRequestSchema = UserPublicSchema
export type UsersUpdateRequest = z.infer<typeof UsersUpdateRequestSchema>
/**
 * Success response schema for PUT /users/{id}/
 * Status: 200
 * 
 */
export const UsersUpdateResponseSchema = UserPublicSchema

export type UsersUpdateResponse = z.infer<typeof UsersUpdateResponseSchema>
/**
 * Parameters schema for PUT /users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UsersUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UsersUpdateParams = z.infer<typeof UsersUpdateParamsSchema>
/**
 * Request schema for PATCH /users/{id}/
 */
export const UsersPartialUpdateRequestSchema = UserPublicSchema
export type UsersPartialUpdateRequest = z.infer<typeof UsersPartialUpdateRequestSchema>
/**
 * Success response schema for PATCH /users/{id}/
 * Status: 200
 * 
 */
export const UsersPartialUpdateResponseSchema = UserPublicSchema

export type UsersPartialUpdateResponse = z.infer<typeof UsersPartialUpdateResponseSchema>
/**
 * Parameters schema for PATCH /users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UsersPartialUpdateParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UsersPartialUpdateParams = z.infer<typeof UsersPartialUpdateParamsSchema>
/**
 * Success response schema for DELETE /users/{id}/
 * Status: 204
 * 
 */
export const UsersDeleteResponseSchema = z.void()

export type UsersDeleteResponse = z.infer<typeof UsersDeleteResponseSchema>
/**
 * Parameters schema for DELETE /users/{id}/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UsersDeleteParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UsersDeleteParams = z.infer<typeof UsersDeleteParamsSchema>
/**
 * Success response schema for GET /users/{id}/loyalty_history/
 * Status: 200
 * 
 */
export const UsersLoyaltyHistoryResponseSchema = UserPublicSchema

export type UsersLoyaltyHistoryResponse = z.infer<typeof UsersLoyaltyHistoryResponseSchema>
/**
 * Parameters schema for GET /users/{id}/loyalty_history/
 * Path params: id
 * Query params: none
 * Header params: none
 */
export const UsersLoyaltyHistoryParamsSchema = z.object({
  path: z.object({
    id: z.string().uuid("Invalid UUID format")
  })
})

export type UsersLoyaltyHistoryParams = z.infer<typeof UsersLoyaltyHistoryParamsSchema>


// Validation helper functions
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    }
  }
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateSchema(schema, data)
}

// Common validation patterns
export const commonPatterns = {
  email: /^[^s@]+@[^s@]+.[^s@]+$/,
  // phone: /^+?[ds-$$$$]+$/,
  // url: /^https?://.+/,
  // uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
}

// Custom error messages
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`
}
