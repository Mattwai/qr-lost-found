"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateQRUrl, type ItemData, STORAGE_KEYS } from "@/lib/config";
import { db } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [items, setItems] = useState<ItemData[]>([]);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState<{
    [key: string]: { days: number; hours: number };
  }>({});

  const loadUserItems = async (email: string) => {
    // Fetch from Supabase
    const userItems = await db.getItemsByEmail(email);

    // Sort by status priority and date
    const sortedItems = userItems.sort((a, b) => {
      const statusPriority: { [key: string]: number } = {
        droppedOff: 1,
        reportedFound: 2,
        active: 3,
        pickedUp: 4,
        expired: 5,
      };

      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;

      return (
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
    });

    setItems(sortedItems);
  };

  const updateItemStatus = async (
    itemId: string,
    newStatus: ItemData["status"],
  ) => {
    // Update in Supabase
    if (newStatus === "active") {
      // Reset to active (false alarm)
      await db.resetItemToActive(itemId);
    } else if (newStatus === "pickedUp") {
      await db.updateItemStatus(itemId, newStatus, {
        pickedUpAt: new Date().toISOString(),
      });
    } else {
      await db.updateItemStatus(itemId, newStatus);
    }

    // Reload items
    if (userEmail) await loadUserItems(userEmail);
  };

  useEffect(() => {
    // Check if user is logged in
    const storedEmail = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    if (storedEmail) {
      setUserEmail(storedEmail);
      setShowLogin(false);
      loadUserItems(storedEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Update countdowns for items with expiry
    const interval = setInterval(() => {
      const newCountdowns: { [key: string]: { days: number; hours: number } } =
        {};

      items.forEach((item) => {
        if (item.status === "droppedOff" && item.expiresAt) {
          const now = new Date().getTime();
          const deadline = new Date(item.expiresAt).getTime();
          const timeLeft = deadline - now;

          if (timeLeft <= 0) {
            newCountdowns[item.id] = { days: 0, hours: 0 };
            // Auto-expire item
            updateItemStatus(item.id, "expired");
          } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            newCountdowns[item.id] = { days, hours };
          }
        }
      });

      setCountdown(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
      setUserEmail(email);
      setShowLogin(false);
      loadUserItems(email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    setUserEmail(null);
    setShowLogin(true);
    setItems([]);
  };

  const getStatusBadge = (status: ItemData["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            ✅ Active
          </span>
        );
      case "reportedFound":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            ⚠️ Reported Found
          </span>
        );
      case "droppedOff":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
            📦 Dropped Off
          </span>
        );
      case "pickedUp":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
            ✅ Picked Up
          </span>
        );
      case "expired":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            ⏰ Expired
          </span>
        );
      default:
        return null;
    }
  };

  const generateVerificationQR = (itemId: string) => {
    // In a real app, this would generate a QR code image
    // For now, we'll just show the item ID
    return generateQRUrl(itemId);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-6xl mb-4 text-center">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Login to Dashboard
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Enter your email to view your registered items
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                My Dashboard
              </h1>
              <p className="text-gray-600">Logged in as: {userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600">Active Items</p>
            <p className="text-2xl font-bold text-gray-800">
              {items.filter((i) => i.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600">Reported Found</p>
            <p className="text-2xl font-bold text-yellow-600">
              {items.filter((i) => i.status === "reportedFound").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600">Awaiting Pickup</p>
            <p className="text-2xl font-bold text-blue-600">
              {items.filter((i) => i.status === "droppedOff").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm text-gray-600">Picked Up</p>
            <p className="text-2xl font-bold text-green-600">
              {items.filter((i) => i.status === "pickedUp").length}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Your Items ({items.length})
            </h2>
            <a
              href="/register"
              className="px-6 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
            >
              + Register New Item
            </a>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Items Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Register your first QR code to get started!
              </p>
              <a
                href="/register"
                className="inline-block px-8 py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Register First Item
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        QR: {item.qrCode}
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Status-specific information */}
                  {item.status === "reportedFound" && (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                      <p className="text-sm text-yellow-800 mb-3">
                        ⚠️ Someone reported finding your item! They haven&apos;t
                        dropped it off yet.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateItemStatus(item.id, "active")}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
                        >
                          False Alarm - I Have It
                        </button>
                      </div>
                    </div>
                  )}

                  {item.status === "droppedOff" && item.location && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        🚨 PICK UP YOUR ITEM!
                      </p>
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>Location:</strong> {item.location.name}
                        <br />
                        <strong>Address:</strong> {item.location.address}
                        <br />
                        <strong>Phone:</strong> {item.location.phone}
                      </p>
                      {countdown[item.id] && (
                        <div className="mb-3">
                          <p className="text-sm text-blue-800 mb-2">
                            Time remaining:
                          </p>
                          <div className="flex gap-2">
                            <div className="bg-white rounded px-3 py-1">
                              <span className="text-lg font-bold text-blue-900">
                                {countdown[item.id].days}
                              </span>
                              <span className="text-xs text-gray-600 ml-1">
                                days
                              </span>
                            </div>
                            <div className="bg-white rounded px-3 py-1">
                              <span className="text-lg font-bold text-blue-900">
                                {countdown[item.id].hours}
                              </span>
                              <span className="text-xs text-gray-600 ml-1">
                                hours
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateItemStatus(item.id, "pickedUp")}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
                        >
                          ✅ Mark as Picked Up
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure this is a false report? This will reset the item to active status.",
                              )
                            ) {
                              updateItemStatus(item.id, "active");
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
                        >
                          Report False Drop-off
                        </button>
                      </div>
                    </div>
                  )}

                  {item.status === "pickedUp" && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                      <p className="text-sm text-green-800 mb-2">
                        ✅ This item was picked up on{" "}
                        {new Date(item.pickedUpAt!).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => updateItemStatus(item.id, "active")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        Reset to Active
                      </button>
                    </div>
                  )}

                  {item.status === "expired" && (
                    <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                      <p className="text-sm text-red-800 mb-2">
                        ⏰ Pickup period expired. The item may have been donated
                        or discarded.
                      </p>
                      <button
                        onClick={() => updateItemStatus(item.id, "active")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        Reset to Active
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        const qrUrl = generateVerificationQR(item.qrCode);
                        alert(
                          `Show this QR code at pickup:\n\n${qrUrl}\n\nOr scan this in the app to verify ownership.`,
                        );
                      }}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                    >
                      📱 Show Verification QR
                    </button>
                    <button
                      onClick={() => router.push(`/found?qr=${item.qrCode}`)}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      👁️ View Public Page
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            Powered by <strong>QR Lost & Found</strong> 📱
          </p>
        </div>
      </div>
    </div>
  );
}
