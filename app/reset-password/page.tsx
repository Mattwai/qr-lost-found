"use client";

import { auth } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import LanguageSwitch from "../components/languageSwitchButton";
import { useTranslation } from "@/hooks/useTranslation";

function ResetPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      // Check if we have the proper hash parameters from the email link
      const hash = window.location.hash;
      if (!hash.includes('access_token') || !hash.includes('refresh_token')) {
        setValidSession(false);
        return;
      }

      // Check if we have a valid session
      const session = await auth.getCurrentSession();
      setValidSession(!!session);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError(t("resetPassword", "passwordsRequired"));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("resetPassword", "passwordsMismatch"));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t("resetPassword", "passwordMinLength"));
      setLoading(false);
      return;
    }

    // Update password
    try {
      const { error: updateError } = await auth.updatePassword(formData.password);

      if (updateError) {
        setError(updateError);
        setLoading(false);
        return;
      }

      // Success
      setPasswordUpdated(true);
      setLoading(false);
    } catch (err) {
      console.error("Password update error:", err);
      setError(t("resetPassword", "updateFailed"));
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show loading while checking session
  if (validSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
        <div className="max-w-md w-full text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">{t("common", "loading")}</p>
        </div>
      </div>
    );
  }

  // Show error if invalid session
  if (validSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              {t("resetPassword", "invalidSession")}
            </h2>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Link
              href="/forgot-password"
              className="inline-block w-full py-3 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              {t("forgotPassword", "sendResetLink")}
            </Link>
            <Link
              href="/login"
              className="block w-full mt-3 py-3 rounded-md font-semibold text-center text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              {t("forgotPassword", "backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (passwordUpdated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              {t("resetPassword", "passwordUpdated")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("resetPassword", "passwordUpdatedDescription")}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Link
              href="/login"
              className="inline-block w-full py-3 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              {t("auth", "signIn")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t("resetPassword", "title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("resetPassword", "subtitle")}
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("resetPassword", "newPassword")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth", "enterPassword")}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                {t("resetPassword", "confirmNewPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("signup", "confirmPasswordPlaceholder")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {loading ? t("resetPassword", "updating") : t("resetPassword", "updatePassword")}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← {t("forgotPassword", "backToLogin")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}