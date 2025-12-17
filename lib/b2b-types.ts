/**
 * B2B SaaS Multi-Tenant Type Definitions
 * Supporting organization-based lost & found management
 */

// =====================================================
// CORE B2B TYPES
// =====================================================

export type UserRole = 'super_admin' | 'org_admin' | 'manager' | 'staff' | 'user';
export type OrganizationPlan = 'trial' | 'basic' | 'pro' | 'enterprise';
export type OrganizationStatus = 'active' | 'suspended' | 'cancelled';
export type UserStatus = 'active' | 'invited' | 'suspended';

// =====================================================
// ORGANIZATION INTERFACES
// =====================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  settings: OrganizationSettings;
  billing_email?: string;
  phone?: string;
  address?: Address;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  branding: {
    logo_url?: string;
    primary_color: string;
    organization_name?: string;
  };
  features: {
    custom_locations: boolean;
    analytics: boolean;
    api_access: boolean;
    white_labeling: boolean;
  };
  limits: {
    max_users: number;
    max_items: number;
    max_locations: number;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    slack_integration: boolean;
  };
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

// =====================================================
// USER & ROLE MANAGEMENT
// =====================================================

export interface OrganizationUser {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  permissions: string[];
  status: UserStatus;
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user?: {
    email: string;
    profile?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  organization?: Organization;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  
  // Joined data
  organization?: Pick<Organization, 'name' | 'slug'>;
  inviter?: {
    email: string;
    profile?: {
      full_name?: string;
    };
  };
}

// =====================================================
// LOCATION MANAGEMENT
// =====================================================

export interface OrganizationLocation {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  operating_hours: OperatingHours;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open?: string;  // "08:00"
  close?: string; // "17:00"
  closed?: boolean;
}

// =====================================================
// ENHANCED ITEM TYPES FOR B2B
// =====================================================

export interface B2BItemData extends Omit<import('./config').ItemData, 'location'> {
  organization_id: string;
  location?: OrganizationLocation;  // Use organization-specific locations
  assigned_staff_id?: string;       // Staff member handling the item
  category?: string;                // Item categorization for schools
  value_estimate?: number;          // Estimated value for insurance
  found_location?: string;          // Where the item was actually found
  notes?: string;                   // Internal staff notes
  parent_notified?: boolean;        // For schools - parent notification status
  
  // Enhanced metadata
  metadata?: {
    photos?: string[];              // URLs to item photos
    serial_number?: string;         // For electronics, etc.
    brand?: string;                 // Item brand/manufacturer
    color?: string;                 // Item color
    size?: string;                  // Item size (clothing, etc.)
    department?: string;            // School department where found
    building?: string;              // Building where found
    room?: string;                  // Room where found
  };
}

// =====================================================
// PERMISSION SYSTEM
// =====================================================

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export type PermissionResource = 
  | 'organization' 
  | 'users' 
  | 'locations' 
  | 'items' 
  | 'reports' 
  | 'settings'
  | 'billing'
  | 'api';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    { resource: 'organization', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'locations', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'items', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reports', actions: ['read', 'manage'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'billing', actions: ['read', 'update', 'manage'] },
    { resource: 'api', actions: ['read', 'manage'] },
  ],
  org_admin: [
    { resource: 'organization', actions: ['read', 'update'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'locations', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'items', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'billing', actions: ['read', 'update'] },
  ],
  manager: [
    { resource: 'users', actions: ['read'] },
    { resource: 'locations', actions: ['read', 'update'] },
    { resource: 'items', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['read'] },
  ],
  staff: [
    { resource: 'locations', actions: ['read'] },
    { resource: 'items', actions: ['read', 'update'] },
  ],
  user: [
    { resource: 'items', actions: ['create', 'read'] },  // Only own items
  ],
};

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  total_items: number;
  active_items: number;
  found_items: number;
  returned_items: number;
  expired_items: number;
  items_this_month: number;
  return_rate: number; // percentage
  avg_return_time: number; // hours
  
  // Organization-specific stats
  total_users: number;
  active_locations: number;
  staff_members: number;
  
  // Trending data
  items_by_month: Array<{
    month: string;
    registered: number;
    found: number;
    returned: number;
  }>;
  
  items_by_category: Array<{
    category: string;
    count: number;
  }>;
  
  items_by_location: Array<{
    location: string;
    count: number;
  }>;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface CreateOrganizationForm {
  name: string;
  slug: string;
  domain?: string;
  plan: OrganizationPlan;
  admin_email: string;
  admin_name: string;
}

export interface InviteUserForm {
  email: string;
  role: UserRole;
  send_email: boolean;
  custom_message?: string;
}

export interface CreateLocationForm {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  operating_hours: OperatingHours;
  is_active: boolean;
}

export interface UpdateOrganizationSettingsForm {
  name?: string;
  settings?: Partial<OrganizationSettings>;
  billing_email?: string;
  phone?: string;
  address?: Address;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type OrganizationWithStats = Organization & {
  stats: {
    total_users: number;
    total_items: number;
    total_locations: number;
    plan_limits: OrganizationSettings['limits'];
  };
};

export type UserWithOrganizations = {
  id: string;
  email: string;
  profile?: {
    full_name?: string;
    avatar_url?: string;
  };
  organizations: Array<{
    organization: Organization;
    role: UserRole;
    status: UserStatus;
    joined_at: string;
  }>;
  default_organization_id?: string;
};

// =====================================================
// WEBHOOK & INTEGRATION TYPES
// =====================================================

export interface WebhookEvent {
  id: string;
  type: 'item.found' | 'item.returned' | 'item.expired' | 'user.invited';
  organization_id: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface APIKey {
  id: string;
  organization_id: string;
  name: string;
  key: string;
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export type {
  // Re-export existing types for convenience
  ItemData,
  Location as LegacyLocation,
} from './config';