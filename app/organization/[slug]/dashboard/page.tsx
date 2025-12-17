"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitch from '@/app/components/languageSwitchButton';
import { analyticsService, organizationService, b2bItemService, userManagementService } from '@/lib/b2b-supabase';
import type { DashboardStats, Organization, B2BItemData, OrganizationUser } from '@/lib/b2b-types';

export default function OrganizationDashboardPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const organizationSlug = params.slug as string;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<B2BItemData[]>([]);
  const [teamMembers, setTeamMembers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'team' | 'settings'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [organizationSlug]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get organization by slug (we'd need to add this to the service)
      // For now, we'll use a mock organization ID
      const orgId = 'mock-org-id'; // TODO: Implement slug-to-id lookup

      // Load parallel data
      const [orgResponse, statsResponse, itemsResponse, teamResponse] = await Promise.all([
        organizationService.getOrganization(orgId),
        analyticsService.getDashboardStats(orgId),
        b2bItemService.getOrganizationItems(orgId, { limit: 10 }),
        userManagementService.getOrganizationUsers(orgId)
      ]);

      if (orgResponse.success) setOrganization(orgResponse.data!);
      if (statsResponse.success) setStats(statsResponse.data!);
      if (itemsResponse.success) setRecentItems(itemsResponse.data!);
      if (teamResponse.success) setTeamMembers(teamResponse.data!);

      if (!orgResponse.success) {
        setError('Organization not found');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Active' },
      reportedFound: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⚠️ Found' },
      droppedOff: { bg: 'bg-blue-100', text: 'text-blue-800', label: '📦 Dropped Off' },
      pickedUp: { bg: 'bg-gray-100', text: 'text-gray-800', label: '✅ Returned' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: '⏰ Expired' },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      org_admin: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Admin' },
      manager: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Manager' },
      staff: { bg: 'bg-green-100', text: 'text-green-800', label: 'Staff' },
      user: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'User' },
    };
    const badge = badges[role as keyof typeof badges] || badges.user;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🏢</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organization?.name}</h1>
                <p className="text-sm text-gray-500">Lost & Found Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitch />
              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                🔔
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'items', label: 'Items', icon: '📦' },
                { id: 'team', label: 'Team', icon: '👥' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_items || 0}</p>
                  </div>
                  <div className="text-3xl">📦</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Items</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.active_items || 0}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Found Items</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats?.found_items || 0}</p>
                  </div>
                  <div className="text-3xl">🔍</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Return Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{Math.round(stats?.return_rate || 0)}%</p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </div>
            </div>

            {/* Recent Items */}
            <div className="bg-white rounded-2xl shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Items</h2>
                  <Link 
                    href={`/organization/${organizationSlug}/items`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentItems.length > 0 ? (
                  <div className="space-y-4">
                    {recentItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">QR: {item.qr_code}</p>
                          <p className="text-xs text-gray-500">
                            Registered {new Date(item.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(item.status)}
                          <button className="text-gray-400 hover:text-gray-600">
                            →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Items Yet</h3>
                    <p className="text-gray-600 mb-6">Start by generating QR codes for your organization</p>
                    <button className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                      Generate QR Codes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href={`/organization/${organizationSlug}/items/create`} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">➕</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Add New Item</h3>
                <p className="text-gray-600 text-sm">Register a new found item in the system</p>
              </Link>

              <Link href={`/organization/${organizationSlug}/qr-codes`} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Generate QR Codes</h3>
                <p className="text-gray-600 text-sm">Create printable QR codes in bulk</p>
              </Link>

              <Link href={`/organization/${organizationSlug}/team/invite`} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">👥</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Invite Team</h3>
                <p className="text-gray-600 text-sm">Add staff members to help manage items</p>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
              <Link 
                href={`/organization/${organizationSlug}/team/invite`}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Invite Member
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow">
              <div className="p-6">
                {teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {member.user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {member.user?.profile?.full_name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-gray-600">{member.user?.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getRoleBadge(member.role)}
                          <button className="text-gray-400 hover:text-gray-600">
                            ⚙️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Team Members Yet</h3>
                    <p className="text-gray-600 mb-6">Invite staff to help manage your lost & found</p>
                    <Link 
                      href={`/organization/${organizationSlug}/team/invite`}
                      className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                      Invite Team Members
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add other tab content as needed */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Items</h2>
            <p className="text-gray-600">Items management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Settings</h2>
            <p className="text-gray-600">Settings interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}