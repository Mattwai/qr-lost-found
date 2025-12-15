"use client";

import { auth, db } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitch from "../components/languageSwitchButton";

function RegisterPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(() => {
    const qrParam = searchParams.get("qr");
    if (!qrParam) return null;

    // Extract QR code from URL if it's a full URL
    let qrCodeId = qrParam;
    if (qrParam.includes("://") || qrParam.includes("/")) {
      // Extract the QR code part - look for QR- pattern in the URL
      const qrMatch = qrParam.match(
        /QR-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i
      );
      if (qrMatch) {
        qrCodeId = qrMatch[0];
      } else {
        // Fallback: extract the last part after the last slash
        qrCodeId = qrParam.substring(qrParam.lastIndexOf("/") + 1);
      }
    }

    // Validate QR code format: must be UUID format (QR-{UUID})
    const uuidRegex =
      /^QR-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (uuidRegex.test(qrCodeId)) {
      return qrCodeId;
    }
    return null; // No valid QR code provided
  });

  // Redirect URL to clean QR parameter if needed
  useEffect(() => {
    const qrParam = searchParams.get("qr");
    if (qrParam && qrCode && qrParam !== qrCode) {
      // Clean up URL - replace the full URL with just the QR code
      const url = new URL(window.location.href);
      url.searchParams.set("qr", qrCode);
      window.history.replaceState({}, "", url.toString());
    }
  }, [qrCode, searchParams]);

  const [formData, setFormData] = useState({
    itemName: "",
    ownerName: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login?redirect=/register");
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        router.push("/login?redirect=/register");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!user) {
      setError(t("register", "mustBeLoggedIn"));
      setIsSubmitting(false);
      return;
    }

    // At this point, qrCode is guaranteed to be non-null due to early return check
    console.log("Registering item with QR code:", qrCode);
    if (!qrCode) {
      setError(t("register", "invalidQRCodeError"));
      setIsSubmitting(false);
      return;
    }

    const itemData = {
      qr_code: qrCode,
      name: formData.itemName,
      ownerName: formData.ownerName,
      ownerEmail: user.email || "", // Use authenticated user's email
      status: "active" as const,
      registeredAt: new Date().toISOString(),
    };

    // Save to Supabase (now uses authenticated user)
    const savedItem = await db.registerItem(itemData);

    if (!savedItem) {
      setError(t("register", "registrationFailed"));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
        </div>
      </div>
    );
  }

  // If no user, useEffect will redirect to login
  if (!user) {
    return null;
  }

  // If no valid QR code provided, show error
  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {t("register", "invalidQRCode")}
            </h1>
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-6">
              <h3 className="font-bold text-yellow-900 mb-2">
                📱 {t("register", "howToRegister")}
              </h3>
              <ol className="text-sm text-yellow-800 text-left space-y-1">
                <li>{t("register", "howToRegisterStep1")}</li>
                <li>{t("register", "howToRegisterStep2")}</li>
                <li>{t("register", "howToRegisterStep3")}</li>
              </ol>
            </div>
            <div className="flex gap-4">
              <a
                href="/scan"
                className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                {t("register", "scanQRCodeLink")}
              </a>
              <a
                href="/dashboard"
                className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
              >
                {t("register", "myDashboard")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {t("register", "registrationComplete")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("register", "registrationSuccess").replace("{item}", formData.itemName)}
            </p>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">
                📊 {t("register", "manageItems")}
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                {t("register", "trackItems")}
              </p>
              <p className="text-xs text-blue-700 mb-4">
                {t("register", "registeredTo")} <strong>{user?.email}</strong>
              </p>
              <a
                href="/dashboard"
                className="inline-block w-full px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                {t("register", "goToDashboard")}
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Powered by <strong>QR Lost & Found</strong> 📱
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t("register", "title")}
          </h1>
          <p className="text-gray-800">
            {t("register", "subtitle")}
          </p>
        </div>

        {/* QR Code Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏷️ {t("register", "qrCodeInfo")}</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-800 mb-2">{t("register", "qrCodeId")}</p>
            <p className="text-lg font-mono font-bold text-gray-800">
              {qrCode}
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 {t("register", "itemInformation")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                {t("register", "itemName")} *
              </label>
              <input
                type="text"
                id="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                placeholder={t("register", "itemNamePlaceholder")}
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                {t("register", "yourName")}
              </label>
              <input
                type="text"
                id="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder={t("register", "yourNamePlaceholder")}
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t("register", "registeredEmail")}
              </label>
              <p className="text-gray-700 font-medium">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t("register", "accountNote")}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? t("register", "registering") : t("register", "registerItem")}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-yellow-50 rounded-2xl shadow-xl p-6 border border-yellow-200">
          <div className="flex items-start">
            <div className="text-3xl mr-4">💡</div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">{t("register", "nextSteps")}</h3>
              <p className="text-sm text-gray-800">
                {t("register", "nextStepsDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-800 text-sm">
            {t("common", "poweredBy")} 📱
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">⏳</div>
          </div>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
