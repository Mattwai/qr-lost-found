"use client";

import { auth } from "@/lib/supabase";
import Link from "next/link";
import { useState } from "react";
import LanguageSwitch from "../components/languageSwitchButton";
import { useTranslation } from "@/hooks/useTranslation";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email) {
      setError(t("forgotPassword", "emailRequired"));
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("forgotPassword", "invalidEmail"));
      setLoading(false);
      return;
    }

    // Send password reset email
    try {
      const { error: resetError } = await auth.sendPasswordResetEmail(email);

      if (resetError) {
        setError(resetError);
        setLoading(false);
        return;
      }

      // Success
      setEmailSent(true);
      setLoading(false);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(t("forgotPassword", "resetFailed"));
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              {t("forgotPassword", "resetLinkSent")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("forgotPassword", "resetLinkSentDescription")}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-sm text-blue-800 text-center">
                📧 {t("forgotPassword", "checkSpam")}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setError("");
                }}
                className="w-full py-3 rounded-md font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
              >
                {t("forgotPassword", "sendAgain")}
              </button>
              <Link
                href="/login"
                className="block w-full py-3 rounded-md font-semibold text-center text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                {t("forgotPassword", "backToLogin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t("forgotPassword", "title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("forgotPassword", "subtitle")}
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

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {t("auth", "emailAddress")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder={t("auth", "enterEmail")}
            />
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
              {loading ? t("forgotPassword", "sendingLink") : t("forgotPassword", "sendResetLink")}
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