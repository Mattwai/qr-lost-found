"use client";

import { generateQRUrl, type ItemData } from "@/lib/config";
import { auth, db } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<{
    [key: string]: { days: number; hours: number };
  }>({});

  const loadUserItems = async (currentUser?: User) => {
    try {
      // Fetch from Supabase (pass user to avoid duplicate auth calls)
      const userItems = await db.getCurrentUserItems(currentUser);

      // Sort by status priority and date
      const sortedItems = userItems.sort((a, b) => {
        const statusPriority: { [key: string]: number } = {
          droppedOff: 1,
          reportedFound: 2,
          active: 3,
          pickedUp: 4,
          expired: 5,
        };

        const priorityDiff =
          statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;

        return (
          new Date(b.registeredAt).getTime() -
          new Date(a.registeredAt).getTime()
        );
      });

      setItems(sortedItems);
    } catch (error) {
      console.error("Failed to load user items:", error);
      // Set empty items on error to prevent infinite loading
      setItems([]);
    }
  };

  const updateItemStatus = async (
    itemId: string,
    newStatus: ItemData["status"]
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
    await loadUserItems(user ?? undefined);
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    const confirmed = confirm(
      `Are you sure you want to unlink "${itemName}"?\n\nThis will permanently remove this QR code from your account. The QR code can be re-registered later.`
    );

    if (!confirmed) return;

    // Delete from Supabase
    const success = await db.deleteItem(itemId);

    if (success) {
      // Reload items
      await loadUserItems(user ?? undefined);
    } else {
      alert("Failed to unlink item. Please try again.");
    }
  };

  useEffect(() => {
    let mounted = true;
    let authCheckTimeout: NodeJS.Timeout;

    // Check authentication and setup auth listener
    const checkAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        authCheckTimeout = setTimeout(() => {
          if (mounted) {
            console.error("Auth check timed out, redirecting to login");
            setLoading(false);
            router.push("/login");
          }
        }, 60000); // 1 minute timeout

        const currentUser = await auth.getCurrentUser();

        if (!mounted) return; // Component unmounted

        clearTimeout(authCheckTimeout);

        if (currentUser) {
          setUser(currentUser);
          await loadUserItems(currentUser);
        } else {
          // Redirect to login if not authenticated
          router.push("/login");
          return; // Don't set loading to false if redirecting
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (mounted) {
          router.push("/login");
          return;
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          await loadUserItems(session.user);
        } else {
          setUser(null);
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        router.push("/login");
      }
    });

    return () => {
      mounted = false;
      clearTimeout(authCheckTimeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
              (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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

  const handleLogout = async () => {
    await auth.signOut();
    // Auth state change will handle redirect
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
              <p className="text-gray-600">Logged in as: {user.email}</p>
              <p className="text-sm text-gray-500">
                Name: {user.user_metadata?.name || "Not provided"}
              </p>
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
              href="/scan"
              className="px-6 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
            >
              📷 Scan QR Code
            </a>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Items Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Scan a QR code to register your first item!
              </p>
              <a
                href="/scan"
                className="inline-block px-8 py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
              >
                📷 Scan QR Code
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
                        QR: {item.qr_code}
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
                                "Are you sure this is a false report? This will reset the item to active status."
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

                  {/* Unlink Button */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleDeleteItem(item.qr_code, item.name)}
                      className="w-full px-4 py-2 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all text-sm"
                    >
                      🗑️ Unlink QR Code
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
