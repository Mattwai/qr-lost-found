"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitch from '@/app/components/languageSwitchButton';
import { organizationService } from '@/lib/b2b-supabase';
import type { CreateOrganizationForm, OrganizationPlan } from '@/lib/b2b-types';

export default function CreateOrganizationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CreateOrganizationForm>({
    name: '',
    slug: '',
    domain: '',
    plan: 'trial',
    admin_email: '',
    admin_name: '',
  });
  
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Generate slug from organization name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug when name changes
      ...(name === 'name' && { slug: generateSlug(value) })
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Organization slug is required');
      return false;
    }
    if (formData.slug.length < 3) {
      setError('Organization slug must be at least 3 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.admin_name.trim()) {
      setError('Admin name is required');
      return false;
    }
    if (!formData.admin_email.trim()) {
      setError('Admin email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.admin_email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      const response = await organizationService.createOrganization(formData);
      
      if (!response.success) {
        setError(response.error || 'Failed to create organization');
        setLoading(false);
        return;
      }

      // Redirect to organization dashboard or onboarding flow
      router.push(`/organization/${response.data?.slug}/onboarding`);
    } catch (err) {
      console.error('Organization creation error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Organization
            </h1>
            <p className="text-gray-600">
              Set up your organization's lost & found management system
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Organization Details</span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300"></div>
              
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Admin Account</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              {/* Step 1: Organization Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Organization Information
                  </h2>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Lincoln High School"
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Identifier *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        yourapp.com/
                      </span>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="lincoln-high"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be your organization's unique URL. Only letters, numbers, and hyphens allowed.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Domain (Optional)
                    </label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., lincolnhigh.edu"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Users with this email domain will automatically be suggested to join your organization.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Selection
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="trial">14-Day Free Trial</option>
                      <option value="basic">Basic Plan - $29/month</option>
                      <option value="pro">Pro Plan - $99/month</option>
                      <option value="enterprise">Enterprise - Contact Sales</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Administrator Account
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Organization:</strong> {formData.name}
                      <br />
                      <strong>URL:</strong> yourapp.com/{formData.slug}
                      <br />
                      <strong>Plan:</strong> {formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="admin_name"
                      name="admin_name"
                      required
                      value={formData.admin_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email Address *
                    </label>
                    <input
                      type="email"
                      id="admin_email"
                      name="admin_email"
                      required
                      value={formData.admin_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@lincolnhigh.edu"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used for billing and important account notifications.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">⚠️</div>
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Important:</strong> As the organization administrator, you will have full access to:
                        </p>
                        <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                          <li>All lost and found items in your organization</li>
                          <li>User management and invitations</li>
                          <li>Location and setting configuration</li>
                          <li>Analytics and reporting</li>
                          <li>Billing and subscription management</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between items-center mt-8">
                <div>
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Link
                    href="/login"
                    className="px-6 py-3 rounded-lg font-semibold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </Link>
                  
                  {step === 1 ? (
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 transition-all flex items-center"
                    >
                      {loading && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {loading ? 'Creating Organization...' : 'Create Organization'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Already have an organization? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}