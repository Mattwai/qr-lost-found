"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface ItemData {
  qrCode: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: "active" | "droppedOff";
  location?: Location;
  droppedOffAt?: string;
  expiresAt?: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
}

const locations: Location[] = [
  {
    id: 1,
    name: "Central Library",
    address: "123 Main Street, Downtown",
    phone: "555-0101",
  },
  {
    id: 2,
    name: "City Police Station",
    address: "456 Oak Avenue, City Center",
    phone: "555-0102",
  },
  {
    id: 3,
    name: "Community Center",
    address: "789 Elm Street, Northside",
    phone: "555-0103",
  },
  {
    id: 4,
    name: "Campus Security Office",
    address: "321 University Drive, Campus",
    phone: "555-0104",
  },
];

type ViewState =
  | "notRegistered"
  | "registered"
  | "dropOffSelection"
  | "droppedOff"
  | "thankYou";

function FoundPageContent() {
  const searchParams = useSearchParams();
  const qrCode = searchParams.get("qr");

  const [viewState, setViewState] = useState<ViewState>("notRegistered");
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    if (!qrCode) return;

    // Load from localStorage
    const loadItemData = () => {
      const items = JSON.parse(localStorage.getItem("qrItems") || "{}");
      const item = items[qrCode];

      if (!item) {
        setViewState("notRegistered");
      } else if (item.status === "droppedOff") {
        setItemData(item);
        setViewState("droppedOff");
      } else {
        setItemData(item);
        setViewState("registered");
      }
    };

    loadItemData();
  }, [qrCode]);

  useEffect(() => {
    if (viewState === "droppedOff" && itemData?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(itemData.expiresAt!).getTime();
        const timeLeft = deadline - now;

        if (timeLeft <= 0) {
          setCountdown({ days: 0, hours: 0 });
          return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        setCountdown({ days, hours });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [viewState, itemData]);

  const handleConfirmDropOff = () => {
    if (!selectedLocation || !qrCode || !itemData) return;

    const updatedItem: ItemData = {
      ...itemData,
      status: "droppedOff",
      location: selectedLocation,
      droppedOffAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const items = JSON.parse(localStorage.getItem("qrItems") || "{}");
    items[qrCode] = updatedItem;
    localStorage.setItem("qrItems", JSON.stringify(items));

    setItemData(updatedItem);
    setViewState("thankYou");
  };

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid QR Code
          </h1>
          <p className="text-gray-600">Please scan a valid QR code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* State 1: Not Registered */}
        {viewState === "notRegistered" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                QR Code Not Registered
              </h1>
              <p className="text-gray-600 mb-6">
                This QR code hasn&apos;t been registered yet.
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

        {/* State 2: Registered - Show Owner Info */}
        {viewState === "registered" && itemData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                This Item Belongs To
              </h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                {itemData.ownerName}
              </p>
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
              onClick={() => setViewState("dropOffSelection")}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              🔍 I Found This Item
            </button>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                ℹ️ For privacy, owner contact details are hidden until you
                report finding the item.
              </p>
            </div>
          </div>
        )}

        {/* State 3: Drop-off Selection */}
        {viewState === "dropOffSelection" && (
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

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📍 Available Locations
              </h2>
              <div className="space-y-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-all ${
                      selectedLocation?.id === location.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start">
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
                      {selectedLocation?.id === location.id && (
                        <div className="ml-3 text-2xl">✅</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmDropOff}
              disabled={!selectedLocation}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
                selectedLocation
                  ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {selectedLocation
                ? "✅ Confirm Drop-off"
                : "Select a Location First"}
            </button>

            <button
              onClick={() => setViewState("registered")}
              className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              ← Back
            </button>
          </div>
        )}

        {/* State 4: Dropped Off (with countdown) */}
        {viewState === "droppedOff" && itemData && (
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
                    {itemData.location?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {itemData.location?.address}
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
                  <div className="mt-2">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-800">
                      <div className="bg-blue-100 rounded-lg px-4 py-2">
                        <span>{countdown.days}</span>
                        <p className="text-xs text-gray-600 mt-1">days</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg px-4 py-2">
                        <span>{countdown.hours}</span>
                        <p className="text-xs text-gray-600 mt-1">hours</p>
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
          </div>
        )}

        {/* State 5: Success Thank You */}
        {viewState === "thankYou" && itemData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Thank You!
              </h1>
              <p className="text-gray-600 mb-6">
                The item has been marked as dropped off at:
              </p>
              <p className="text-xl font-bold text-blue-600 mb-2">
                {itemData.location?.name}
              </p>
              <p className="text-gray-600 mb-6">{itemData.location?.address}</p>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <p className="text-blue-800 mb-2">
                  💙 You&apos;re awesome for helping return this item!
                </p>
                <p className="text-sm text-blue-700">
                  The owner has been notified and will pick it up within 7 days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
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
