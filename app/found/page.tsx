"use client";

import { DROP_OFF_LOCATIONS, type ItemData, type Location } from "@/lib/config";
import { db } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ViewState =
  | "notRegistered"
  | "active"
  | "reportedFound"
  | "selectLocation"
  | "confirmDropOff"
  | "droppedOff"
  | "pickedUp"
  | "expired";

function FoundPageContent() {
  const searchParams = useSearchParams();
  const qrCode = searchParams.get("qr")?.toLowerCase() || null;

  const [viewState, setViewState] = useState<ViewState>("notRegistered");
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  const loadItemData = async () => {
    if (!qrCode) return;

    // Fetch from Supabase
    const item = await db.getItemByQrCode(qrCode);

    if (!item) {
      setViewState("notRegistered");
      return;
    }

    setItemData(item);

    // Set view state based on item status
    switch (item.status) {
      case "active":
        setViewState("active");
        break;
      case "reportedFound":
        setViewState("reportedFound");
        break;
      case "droppedOff":
        setViewState("droppedOff");
        break;
      case "pickedUp":
        setViewState("pickedUp");
        break;
      case "expired":
        setViewState("expired");
        break;
      default:
        setViewState("active");
    }
  };

  const updateItemStatus = async (newStatus: ItemData["status"]) => {
    if (!qrCode) return;

    // Update in Supabase
    const additionalData: any = {};

    if (newStatus === "reportedFound") {
      additionalData.reportedFoundAt = new Date().toISOString();
    } else if (newStatus === "droppedOff" && selectedLocation) {
      additionalData.droppedOffAt = new Date().toISOString();
      additionalData.expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      additionalData.location = selectedLocation;
    }

    await db.updateItemStatus(qrCode, newStatus, additionalData);
    await loadItemData();
  };

  useEffect(() => {
    if (!qrCode) return;

    loadItemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode]);

  useEffect(() => {
    if (viewState === "droppedOff" && itemData?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(itemData.expiresAt!).getTime();
        const timeLeft = deadline - now;

        if (timeLeft <= 0) {
          setCountdown({ days: 0, hours: 0, minutes: 0 });

          // Auto-expire if needed
          if (itemData.status === "droppedOff") {
            updateItemStatus("expired");
          }
          return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown({ days, hours, minutes });
      }, 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState, itemData]);

  const handleReportFound = () => {
    updateItemStatus("reportedFound");
  };

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setViewState("confirmDropOff");
  };

  const handleConfirmDropOff = () => {
    if (!selectedLocation) return;
    updateItemStatus("droppedOff");
  };

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid QR Code
          </h1>
          <p className="text-gray-600 mb-6">Please scan a valid QR code.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* State: Not Registered */}
        {viewState === "notRegistered" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                QR Code Not Registered
              </h1>
              <p className="text-gray-600 mb-6">
                This QR code hasn&apos;t been registered yet. Register it to
                start protecting your item!
              </p>
              <a
                href={`/register?qr=${qrCode}`}
                className="inline-block w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Register This QR Code
              </a>
            </div>
          </div>
        )}

        {/* State: Active - Show Owner Info */}
        {viewState === "active" && itemData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">👋</div>
              {itemData.ownerName ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    This Item Belongs To
                  </h1>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {itemData.ownerName}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Lost Item Found
                </h1>
              )}
              <p className="text-gray-600">
                If you found this item, please help return it!
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📦 Item Details
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Item:</p>
                <p className="text-lg font-bold text-gray-800">
                  {itemData.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleReportFound}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              🔍 I Found This Item
            </button>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                ℹ️ For privacy, owner contact details are hidden until you
                report finding the item and confirm drop-off.
              </p>
            </div>
          </div>
        )}

        {/* State: Reported Found - Show Drop-off Locations */}
        {(viewState === "reportedFound" || viewState === "selectLocation") &&
          itemData && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">📍</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Select Drop-off Location
                </h1>
                <p className="text-gray-600">
                  Please drop off the item at one of these partner locations:
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ The owner has been notified that you found their item.
                  Please select where you&apos;ll drop it off.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📍 Available Locations
                </h2>
                <div className="space-y-3">
                  {DROP_OFF_LOCATIONS.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelectLocation(location)}
                      className="w-full border-2 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-all border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">
                            {location.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {location.address}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            📞 {location.phone}
                          </p>
                        </div>
                        <div className="ml-3 text-2xl">→</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* State: Confirm Drop-off */}
        {viewState === "confirmDropOff" && itemData && selectedLocation && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Confirm Drop-off
              </h1>
              <p className="text-gray-600">You selected:</p>
              <p className="text-xl font-bold text-blue-600 mt-2">
                {selectedLocation.name}
              </p>
              <p className="text-gray-600 mt-1">{selectedLocation.address}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
              <div className="flex items-start">
                <div className="text-3xl mr-4">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-900 mb-2">Important</h3>
                  <p className="text-sm text-red-800">
                    Please only click &quot;I Dropped It Off&quot; after you
                    have physically dropped off the item at the location. This
                    helps us maintain trust in the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">📋 Instructions:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>
                    Take the item to <strong>{selectedLocation.name}</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>
                    Tell the staff you&apos;re dropping off a lost item from QR
                    Lost & Found
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>
                    After drop-off, return here and click the button below
                  </span>
                </li>
              </ol>
            </div>

            <button
              onClick={handleConfirmDropOff}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              ✅ I Dropped It Off Here
            </button>

            <button
              onClick={() => setViewState("reportedFound")}
              className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              ← Choose Different Location
            </button>
          </div>
        )}

        {/* State: Dropped Off (with countdown) */}
        {viewState === "droppedOff" && itemData && itemData.location && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Item Awaiting Pickup
              </h1>
              <p className="text-gray-600 mb-4">
                This item is at a drop-off location
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-green-900 mb-4">
                ✅ Drop-off Confirmed
              </h2>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Location:</p>
                  <p className="text-lg font-bold text-gray-800">
                    {itemData.location.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {itemData.location.address}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📞 {itemData.location.phone}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pickup Deadline:</p>
                  <p className="text-lg font-bold text-red-600">
                    {itemData.expiresAt &&
                      new Date(itemData.expiresAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">
                      Time remaining:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-blue-100 rounded-lg px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {countdown.days}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">days</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {countdown.hours}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">hours</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {countdown.minutes}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">mins</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800 text-center">
                ⏰ The owner has 7 days to pick up this item. After that, it may
                be donated or discarded.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                💙 Thank you for helping return this item to its owner!
              </p>
            </div>
          </div>
        )}

        {/* State: Picked Up */}
        {viewState === "pickedUp" && itemData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Item Retrieved!
              </h1>
              <p className="text-gray-600">
                This item has been picked up by the owner.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <p className="text-sm text-green-800 text-center">
                ✅ The owner successfully retrieved their{" "}
                <strong>{itemData.name}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* State: Expired */}
        {viewState === "expired" && itemData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Pickup Period Expired
              </h1>
              <p className="text-gray-600">
                The 7-day pickup window for this item has expired.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <p className="text-sm text-red-800 text-center">
                The item may have been donated or discarded according to the
                drop-off location&apos;s policy.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
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

export default function FoundPage() {
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
      <FoundPageContent />
    </Suspense>
  );
}
