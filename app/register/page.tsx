"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { STORAGE_KEYS } from "@/lib/config";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const [qrCode] = useState<string>(() => {
    const qrParam = searchParams.get("qr");
    return qrParam || `QR-${Date.now()}`;
  });

  const [formData, setFormData] = useState({
    itemName: "",
    ownerName: "",
    ownerEmail: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const itemData = {
      id: qrCode,
      qrCode: qrCode,
      name: formData.itemName,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      status: "active" as const,
      registeredAt: new Date().toISOString(),
    };

    // Store in localStorage
    const items = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.QR_ITEMS) || "{}",
    );
    items[qrCode] = itemData;
    localStorage.setItem(STORAGE_KEYS.QR_ITEMS, JSON.stringify(items));

    setShowSuccess(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

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
                Login with: <strong>{formData.ownerEmail}</strong>
              </p>
              <a
                href="/dashboard"
                className="inline-block w-full px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Go to Dashboard
              </a>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-xl font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all"
          >
            Register Another Item
          </button>

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

            <div>
              <label
                htmlFor="ownerEmail"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Your Email *
              </label>
              <input
                type="email"
                id="ownerEmail"
                required
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Register Item
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
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
