-- B2B SaaS Multi-Tenant Database Schema
-- Phase 1: Foundation for Organization-Based Multi-Tenancy

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  domain TEXT, -- school.edu, company.com for domain-based signup
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'basic', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{
    "branding": {
      "logo_url": null,
      "primary_color": "#3B82F6",
      "organization_name": null
    },
    "features": {
      "custom_locations": true,
      "analytics": false,
      "api_access": false,
      "white_labeling": false
    },
    "limits": {
      "max_users": 50,
      "max_items": 1000,
      "max_locations": 10
    },
    "notifications": {
      "email_notifications": true,
      "sms_notifications": false,
      "slack_integration": false
    }
  }'::jsonb,
  billing_email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- =====================================================
-- ORGANIZATION USERS (Many-to-Many with Roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'org_admin', 'manager', 'staff', 'user')),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[], -- Additional granular permissions
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique user-organization combination
  UNIQUE(user_id, organization_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_role ON organization_users(role);
CREATE INDEX IF NOT EXISTS idx_organization_users_status ON organization_users(status);

-- =====================================================
-- ENHANCE EXISTING TABLES FOR MULTI-TENANCY
-- =====================================================

-- Add organization_id to existing items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add organization_id to profiles table for user context
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_organization_id UUID REFERENCES organizations(id);

-- =====================================================
-- ORGANIZATION-SPECIFIC LOCATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  operating_hours JSONB DEFAULT '{
    "monday": {"open": "08:00", "close": "17:00"},
    "tuesday": {"open": "08:00", "close": "17:00"},
    "wednesday": {"open": "08:00", "close": "17:00"},
    "thursday": {"open": "08:00", "close": "17:00"},
    "friday": {"open": "08:00", "close": "17:00"},
    "saturday": {"closed": true},
    "sunday": {"closed": true}
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_org_locations_org_id ON organization_locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_locations_active ON organization_locations(is_active);

-- =====================================================
-- ORGANIZATION INVITATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('org_admin', 'manager', 'staff', 'user')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate invitations
  UNIQUE(organization_id, email)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON organization_invitations(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see organizations they belong to
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Organizations: Only org_admins can update their organization
CREATE POLICY "Organization admins can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'org_admin')
        AND status = 'active'
    )
  );

-- Organization Users: Users can view all members of their organizations
CREATE POLICY "Users can view organization members" ON organization_users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Organization Users: Only admins can manage organization memberships
CREATE POLICY "Admins can manage organization users" ON organization_users
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'org_admin')
        AND status = 'active'
    )
  );

-- Organization Locations: Users can view locations of their organizations
CREATE POLICY "Users can view organization locations" ON organization_locations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Organization Locations: Only admins and managers can manage locations
CREATE POLICY "Admins and managers can manage locations" ON organization_locations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'org_admin', 'manager')
        AND status = 'active'
    )
  );

-- UPDATE EXISTING ITEMS RLS FOR MULTI-TENANCY
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;

-- Items: Users can only see items from their organizations
CREATE POLICY "Users can view organization items" ON items
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR 
    -- Allow public access for QR scanning (found page)
    organization_id IS NOT NULL
  );

-- Items: Users can create items in their organizations
CREATE POLICY "Users can create organization items" ON items
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND user_id = auth.uid()
  );

-- Items: Users can update items in their organizations (with role-based permissions)
CREATE POLICY "Users can update organization items" ON items
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
      AND (
        -- Item owners can always update their items
        user_id = auth.uid()
        OR
        -- Staff and above can update any items in their org
        role IN ('super_admin', 'org_admin', 'manager', 'staff')
      )
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  organization_id UUID,
  organization_name TEXT,
  role TEXT,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ou.organization_id,
    o.name as organization_name,
    ou.role,
    ou.status
  FROM organization_users ou
  JOIN organizations o ON ou.organization_id = o.id
  WHERE ou.user_id = user_uuid AND ou.status = 'active';
END;
$$;

-- Function to check if user has permission in organization
CREATE OR REPLACE FUNCTION user_has_org_permission(
  org_id UUID,
  required_role TEXT,
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  role_hierarchy TEXT[] := ARRAY['user', 'staff', 'manager', 'org_admin', 'super_admin'];
  required_level INTEGER;
  user_level INTEGER;
BEGIN
  -- Get user's role in the organization
  SELECT role INTO user_role
  FROM organization_users
  WHERE user_id = user_uuid 
    AND organization_id = org_id 
    AND status = 'active';
  
  -- If user not found in org, return false
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get role hierarchy levels
  required_level := array_position(role_hierarchy, required_role);
  user_level := array_position(role_hierarchy, user_role);
  
  -- Return true if user's level is >= required level
  RETURN user_level >= required_level;
END;
$$;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at BEFORE UPDATE ON organization_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_locations_updated_at BEFORE UPDATE ON organization_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample organization (for testing)
INSERT INTO organizations (name, slug, domain, plan, status) 
VALUES (
  'Demo School District',
  'demo-school',
  'demoschool.edu',
  'pro',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- Get the demo organization ID
DO $$
DECLARE
  demo_org_id UUID;
BEGIN
  SELECT id INTO demo_org_id FROM organizations WHERE slug = 'demo-school';
  
  -- Insert sample locations for demo organization
  INSERT INTO organization_locations (organization_id, name, address, phone, contact_person) 
  VALUES 
    (demo_org_id, 'Main Office', '123 School St, Demo City, DC 12345', '(555) 123-4567', 'Jane Smith'),
    (demo_org_id, 'Library', '123 School St, Demo City, DC 12345', '(555) 123-4568', 'Bob Johnson'),
    (demo_org_id, 'Gymnasium', '123 School St, Demo City, DC 12345', '(555) 123-4569', 'Mike Wilson')
  ON CONFLICT DO NOTHING;
END
$$;