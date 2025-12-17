/**
 * B2B SaaS Supabase Service Layer
 * Handles multi-tenant operations for organization-based lost & found
 */

import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';
import type {
  Organization,
  OrganizationUser,
  OrganizationLocation,
  OrganizationInvitation,
  B2BItemData,
  UserRole,
  DashboardStats,
  CreateOrganizationForm,
  InviteUserForm,
  CreateLocationForm,
  ApiResponse,
} from './b2b-types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// ORGANIZATION MANAGEMENT
// =====================================================

export const organizationService = {
  // Create new organization
  async createOrganization(data: CreateOrganizationForm): Promise<ApiResponse<Organization>> {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
          domain: data.domain,
          plan: data.plan,
          billing_email: data.admin_email,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: org };
    } catch (error) {
      return { success: false, error: 'Failed to create organization' };
    }
  },

  // Get organizations for current user
  async getUserOrganizations(): Promise<ApiResponse<Organization[]>> {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          organization_id,
          role,
          status,
          organizations:organization_id (
            id,
            name,
            slug,
            plan,
            status,
            settings,
            created_at
          )
        `)
        .eq('status', 'active');

      if (error) {
        return { success: false, error: error.message };
      }

      const organizations = data?.map((item: any) => item.organizations) || [];
      return { success: true, data: organizations };
    } catch (error) {
      return { success: false, error: 'Failed to fetch organizations' };
    }
  },

  // Get organization by ID
  async getOrganization(id: string): Promise<ApiResponse<Organization>> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch organization' };
    }
  },

  // Update organization settings
  async updateOrganization(
    id: string,
    updates: Partial<Organization>
  ): Promise<ApiResponse<Organization>> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update organization' };
    }
  },
};

// =====================================================
// USER & ROLE MANAGEMENT
// =====================================================

export const userManagementService = {
  // Get organization users
  async getOrganizationUsers(organizationId: string): Promise<ApiResponse<OrganizationUser[]>> {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          *,
          users:user_id (
            email,
            profiles:profiles(full_name, avatar_url)
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch organization users' };
    }
  },

  // Invite user to organization
  async inviteUser(
    organizationId: string,
    inviteData: InviteUserForm
  ): Promise<ApiResponse<OrganizationInvitation>> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('organization_users')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (existingUser && existingUser.length > 0) {
        return { success: false, error: 'User already belongs to this organization' };
      }

      // Create invitation
      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organizationId,
          email: inviteData.email,
          role: inviteData.role,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // TODO: Send invitation email
      // await emailService.sendInvitation(data);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to invite user' };
    }
  },

  // Accept invitation
  async acceptInvitation(token: string): Promise<ApiResponse<OrganizationUser>> {
    try {
      // Get invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('token', token)
        .eq('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' };
      }

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create organization user
      const { data: orgUser, error } = await supabase
        .from('organization_users')
        .insert({
          user_id: user.id,
          organization_id: invitation.organization_id,
          role: invitation.role,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Mark invitation as accepted
      await supabase
        .from('organization_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return { success: true, data: orgUser };
    } catch (error) {
      return { success: false, error: 'Failed to accept invitation' };
    }
  },

  // Update user role
  async updateUserRole(
    organizationId: string,
    userId: string,
    role: UserRole
  ): Promise<ApiResponse<OrganizationUser>> {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update user role' };
    }
  },

  // Remove user from organization
  async removeUser(organizationId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove user' };
    }
  },
};

// =====================================================
// LOCATION MANAGEMENT
// =====================================================

export const locationService = {
  // Get organization locations
  async getOrganizationLocations(organizationId: string): Promise<ApiResponse<OrganizationLocation[]>> {
    try {
      const { data, error } = await supabase
        .from('organization_locations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch locations' };
    }
  },

  // Create location
  async createLocation(
    organizationId: string,
    locationData: CreateLocationForm
  ): Promise<ApiResponse<OrganizationLocation>> {
    try {
      const { data, error } = await supabase
        .from('organization_locations')
        .insert({
          organization_id: organizationId,
          ...locationData,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create location' };
    }
  },

  // Update location
  async updateLocation(
    id: string,
    updates: Partial<OrganizationLocation>
  ): Promise<ApiResponse<OrganizationLocation>> {
    try {
      const { data, error } = await supabase
        .from('organization_locations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update location' };
    }
  },

  // Delete location
  async deleteLocation(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('organization_locations')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete location' };
    }
  },
};

// =====================================================
// B2B ITEM MANAGEMENT
// =====================================================

export const b2bItemService = {
  // Get organization items with filters
  async getOrganizationItems(
    organizationId: string,
    filters?: {
      status?: string;
      location_id?: string;
      assigned_staff_id?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<B2BItemData[]>> {
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          organization_locations:location_id (*)
        `)
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }
      if (filters?.assigned_staff_id) {
        query = query.eq('assigned_staff_id', filters.assigned_staff_id);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by most recent
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch items' };
    }
  },

  // Create B2B item
  async createItem(itemData: Omit<B2BItemData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<B2BItemData>> {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          ...itemData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create item' };
    }
  },

  // Update item with staff assignment
  async updateItem(
    id: string,
    updates: Partial<B2BItemData>
  ): Promise<ApiResponse<B2BItemData>> {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('qr_code', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update item' };
    }
  },

  // Assign staff to item
  async assignStaff(itemId: string, staffId: string): Promise<ApiResponse<B2BItemData>> {
    try {
      return this.updateItem(itemId, { assigned_staff_id: staffId });
    } catch (error) {
      return { success: false, error: 'Failed to assign staff' };
    }
  },
};

// =====================================================
// ANALYTICS & REPORTING
// =====================================================

export const analyticsService = {
  // Get organization dashboard stats
  async getDashboardStats(organizationId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get basic item counts
      const { data: itemCounts } = await supabase
        .from('items')
        .select('status')
        .eq('organization_id', organizationId);

      // Get user counts
      const { data: userCounts } = await supabase
        .from('organization_users')
        .select('role, status')
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      // Get location counts
      const { data: locationCounts } = await supabase
        .from('organization_locations')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      // Calculate stats
      const total_items = itemCounts?.length || 0;
      const active_items = itemCounts?.filter(i => i.status === 'active').length || 0;
      const found_items = itemCounts?.filter(i => i.status === 'reportedFound').length || 0;
      const returned_items = itemCounts?.filter(i => i.status === 'pickedUp').length || 0;
      const expired_items = itemCounts?.filter(i => i.status === 'expired').length || 0;

      const total_users = userCounts?.length || 0;
      const staff_members = userCounts?.filter(u => ['staff', 'manager', 'org_admin'].includes(u.role)).length || 0;
      const active_locations = locationCounts?.length || 0;

      const return_rate = total_items > 0 ? (returned_items / total_items) * 100 : 0;

      const stats: DashboardStats = {
        total_items,
        active_items,
        found_items,
        returned_items,
        expired_items,
        items_this_month: 0, // TODO: Calculate with date filtering
        return_rate,
        avg_return_time: 0, // TODO: Calculate from timestamps
        total_users,
        active_locations,
        staff_members,
        items_by_month: [], // TODO: Implement monthly aggregation
        items_by_category: [], // TODO: Implement category grouping
        items_by_location: [], // TODO: Implement location grouping
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: 'Failed to fetch dashboard stats' };
    }
  },
};

// =====================================================
// PERMISSION CHECKING
// =====================================================

export const permissionService = {
  // Check if user has permission in organization
  async hasPermission(
    organizationId: string,
    resource: string,
    action: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const currentUser = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!currentUser) return false;

      const { data } = await supabase
        .from('organization_users')
        .select('role, permissions')
        .eq('organization_id', organizationId)
        .eq('user_id', currentUser)
        .eq('status', 'active')
        .single();

      if (!data) return false;

      // Super admin has all permissions
      if (data.role === 'super_admin') return true;

      // Check role-based permissions (implement logic based on ROLE_PERMISSIONS)
      // For now, simplified permission check
      const roleHierarchy = ['user', 'staff', 'manager', 'org_admin', 'super_admin'];
      const userLevel = roleHierarchy.indexOf(data.role);
      
      // Basic permission logic - can be enhanced
      if (resource === 'items' && userLevel >= 1) return true;
      if (resource === 'locations' && userLevel >= 2) return true;
      if (resource === 'users' && userLevel >= 3) return true;
      if (resource === 'organization' && userLevel >= 3) return true;

      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  // Get user's role in organization
  async getUserRole(organizationId: string, userId?: string): Promise<UserRole | null> {
    try {
      const currentUser = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!currentUser) return null;

      const { data } = await supabase
        .from('organization_users')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', currentUser)
        .eq('status', 'active')
        .single();

      return data?.role || null;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  },
};

// Export the initialized Supabase client for direct access if needed
export { supabase };

// Export all services as a single object for convenience
export const b2bServices = {
  organizations: organizationService,
  users: userManagementService,
  locations: locationService,
  items: b2bItemService,
  analytics: analyticsService,
  permissions: permissionService,
};