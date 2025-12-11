"use client";

import { auth, db } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode] = useState<string>(() => {
    const qrParam = searchParams.get("qr");
    return qrParam || `QR-${Date.now()}`;
  });

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
        // Pre-fill owner name from user metadata
        setFormData((prev) => ({
          ...prev,
          ownerName: currentUser.user_metadata?.name || "",
        }));
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
        setFormData((prev) => ({
          ...prev,
          ownerName: session.user.user_metadata?.name || "",
        }));
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
      setError("You must be logged in to register items.");
      setIsSubmitting(false);
      return;
    }

    const itemData = {
      id: qrCode,
      qrCode: qrCode,
      name: formData.itemName,
      ownerName: formData.ownerName,
      ownerEmail: user.email || "", // Use authenticated user's email
      status: "active" as const,
      registeredAt: new Date().toISOString(),
    };

    // Save to Supabase (now uses authenticated user)
    const savedItem = await db.registerItem(itemData);

    if (!savedItem) {
      setError("Failed to register item. Please try again.");
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Registration Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              Your <strong>{formData.itemName}</strong> has been registered
              successfully.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">
                📊 Manage Your Items
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Track your registered items and get notified if they&apos;re
                found!
              </p>
              <p className="text-xs text-blue-700 mb-4">
                Registered to: <strong>{user?.email}</strong>
              </p>
              <a
                href="/dashboard"
                className="inline-block w-full px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Go to Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Register Your QR Code
          </h1>
          <p className="text-gray-800">
            Protect your items with QR Lost & Found
          </p>
        </div>

        {/* QR Code Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏷️ QR Code</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-800 mb-2">QR Code ID:</p>
            <p className="text-lg font-mono font-bold text-gray-800">
              {qrCode}
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 Item Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g., Black Backpack, Water Bottle"
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Your Name (optional)
              </label>
              <input
                type="text"
                id="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Registered Email
              </label>
              <p className="text-gray-700 font-medium">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Items will be registered to your authenticated account
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
              {isSubmitting ? "Registering..." : "Register Item"}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-yellow-50 rounded-2xl shadow-xl p-6 border border-yellow-200">
          <div className="flex items-start">
            <div className="text-3xl mr-4">💡</div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Next Steps</h3>
              <p className="text-sm text-gray-800">
                After registration, keep this QR code on your item. If someone
                finds it, they can scan it with their phone camera to help
                return it to you!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-800 text-sm">
            Powered by <strong>QR Lost & Found</strong> 📱
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
