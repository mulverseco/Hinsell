export interface LoginResponse {
  access: string;
  refresh: string;
}

enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    PREFER_NOT_TO_SAY = 'prefer_not_to_say',
    OTHER = 'other',
}

enum ProfileVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    COLLEAGUES = 'colleagues',
}

export interface UserProfile {
    bio?: string;
    avatar?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    gender?: Gender;
    profile_visibility?: ProfileVisibility;
    enable_email_notifications?: boolean;
    enable_sms_notifications?: boolean;
    enable_whatsapp_notifications?: boolean;
    enable_in_app_notifications?: boolean;
    enable_push_notifications?: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_two_factor_enabled?: boolean;
  use_reports?: boolean;
  use_ledger_system?: boolean;
  use_inventory_system?: boolean;
  use_purchase_system?: boolean;
  use_sales_system?: boolean;
  use_medical_management?: boolean;
  default_branch?: string;
  profile: UserProfile;
}

// Reporting type definitions
export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  category: ReportCategory;
  code: string;
  name: string;
  parent?: string;
  description: string;
  report_type: 'tabular' | 'chart' | 'dashboard' | 'export';
  query_config: {
    model: string;
    fields: string[];
    default_filters: Record<string, any>;
    parameters: Record<string, {
      type: 'string' | 'number' | 'date' | 'boolean' | 'select';
      required: boolean;
      default?: any;
      options?: Array<{ value: any; label: string }>;
    }>;
  };
  parameters: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    default_value?: any;
    options?: Array<{ value: any; label: string }>;
  }>;
  columns: Array<{
    field: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage';
    width?: number;
    sortable: boolean;
    filterable: boolean;
    format?: string;
  }>;
  chart_config: {
    type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    x_axis?: string;
    y_axis?: string;
    series?: string[];
    colors?: string[];
  };
  formatting_rules: {
    conditional_formatting?: Array<{
      field: string;
      condition: 'gt' | 'lt' | 'eq' | 'contains';
      value: any;
      style: Record<string, string>;
    }>;
    number_format?: {
      decimal_places: number;
      thousands_separator: boolean;
      currency_symbol?: string;
    };
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  template: ReportTemplate;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result_data?: any[];
  error_message?: string;
  row_count: number;
  duration_seconds: number;
  executed_by: string;
  executed_at: string;
  expires_at: string;
}

export interface ReportRequest {
  template_id?: string;
  parameters: Record<string, any>;
  format?: 'json' | 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  sorting?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  pagination?: {
    page: number;
    page_size: number;
  };
}

export interface ReportResponse {
  success: boolean;
  data: any[];
  meta: {
    row_count: number;
    duration_seconds: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
    has_next?: boolean;
    has_previous?: boolean;
  };
  columns: Array<{
    field: string;
    label: string;
    type: string;
  }>;
  chart_data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
    }>;
  };
  error?: string;
}

export interface ReportFilters {
  category_id?: string;
  report_type?: ReportTemplate['report_type'];
  is_active?: boolean;
  search?: string;
}

