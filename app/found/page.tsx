"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { DROP_OFF_LOCATIONS, type ItemData, type Location } from "@/lib/config";
import { db } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import LanguageSwitch from "../components/languageSwitchButton";
import { extractQRCode, isValidQRCode } from "@/lib/qr-utils";

type ViewState =
  | "loading"
  | "notRegistered"
  | "active"
  | "reportedFound"
  | "selectLocation"
  | "confirmDropOff"
  | "droppedOff"
  | "pickedUp"
  | "expired";

function FoundPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const rawQrParam = searchParams.get("qr");
  
  // Extract clean QR code from the parameter
  const qrCode = rawQrParam ? extractQRCode(rawQrParam) : null;

  const [viewState, setViewState] = useState<ViewState>("loading");
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  const loadItemData = async () => {
    if (!qrCode || !isValidQRCode(qrCode)) {
      console.error("Invalid QR code:", qrCode);
      setViewState("notRegistered");
      return;
    }

    console.log("Loading item data for QR code:", qrCode);

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
            {t("common", "invalidQRCode")}
          </h1>
          <p className="text-gray-600 mb-6">{t("found", "invalidQRMessage")}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            {t("common", "goToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* State: Loading */}
        {viewState === "loading" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {t("found", "loadingTitle")}
              </h1>
              <p className="text-gray-600">
                {t("found", "loadingDescription")}
              </p>
            </div>
          </div>
        )}

        {/* State: Not Registered */}
        {viewState === "notRegistered" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {t("found", "notRegisteredTitle")}
              </h1>
              <p className="text-gray-600 mb-6">
                {t("found", "notRegisteredDescription")}
              </p>
              <a
                href={`/register?qr=${qrCode}`}
                className="inline-block w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
              >
                {t("found", "registerThisQR")}
              </a>
            </div>
          </div>
        )}

        {/* State: Active - Show Owner Info */}
        {viewState === "active" && itemData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">👋</div>
              {itemData.ownerName && itemData.ownerName.trim() ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("found", "thisItemBelongsTo")}
                  </h1>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {itemData.ownerName}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  {t("found", "lostItemFound")}
                </h1>
              )}
              <p className="text-gray-600">{t("found", "helpReturn")}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📦 {t("found", "itemDetails")}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t("found", "item")}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {itemData.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleReportFound}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              🔍 {t("found", "iFoundThis")}
            </button>
          </div>
        )}

        {/* State: Reported Found - Show Drop-off Locations */}
        {(viewState === "reportedFound" || viewState === "selectLocation") &&
          itemData && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">📍</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("found", "selectDropoffLocation")}
                </h1>
                <p className="text-gray-600">
                  {t("found", "dropoffInstruction")}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ {t("found", "ownerNotified")}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📍 {t("found", "availableLocations")}
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
                {t("found", "confirmDropoff")}
              </h1>
              <p className="text-gray-600">{t("found", "youSelected")}</p>
              <p className="text-xl font-bold text-blue-600 mt-2">
                {selectedLocation.name}
              </p>
              <p className="text-gray-600 mt-1">{selectedLocation.address}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
              <div className="flex items-start">
                <div className="text-3xl mr-4">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-900 mb-2">
                    {t("found", "important")}
                  </h3>
                  <p className="text-sm text-red-800">
                    {t("found", "dropoffWarning")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">
                📋 {t("found", "instructions")}
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>
                    {t("found", "instruction1").replace(
                      "{location}",
                      selectedLocation.name
                    )}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>{t("found", "instruction2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>{t("found", "instruction3")}</span>
                </li>
              </ol>
            </div>

            <button
              onClick={handleConfirmDropOff}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              ✅ {t("found", "iDroppedItOff")}
            </button>

            <button
              onClick={() => setViewState("reportedFound")}
              className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              ← {t("found", "chooseDifferent")}
            </button>
          </div>
        )}

        {/* State: Dropped Off (with countdown) */}
        {viewState === "droppedOff" && itemData && itemData.location && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {t("found", "awaitingPickupTitle")}
              </h1>
              <p className="text-gray-600 mb-4">
                {t("found", "awaitingPickupDescription")}
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-green-900 mb-4">
                ✅ {t("found", "dropoffConfirmed")}
              </h2>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {t("found", "location")}
                  </p>
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
                  <p className="text-sm text-gray-600 mb-1">
                    {t("found", "pickupDeadline")}
                  </p>
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
                      {t("found", "timeRemaining")}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-blue-100 rounded-lg px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {countdown.days}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {t("found", "days")}
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-lg px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {countdown.hours}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {t("found", "hours")}
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-lg px-4 py-3 text-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {countdown.minutes}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {t("found", "mins")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800 text-center">
                ⏰ {t("found", "sevenDayNotice")}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                💙 {t("found", "thankYou")}
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
                {t("found", "itemRetrieved")}
              </h1>
              <p className="text-gray-600">
                {t("found", "itemRetrievedDescription")}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <p className="text-sm text-green-800 text-center">
                ✅{" "}
                {t("found", "ownerRetrieved").replace("{item}", itemData.name)}
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
                {t("found", "pickupExpired")}
              </h1>
              <p className="text-gray-600">
                {t("found", "pickupExpiredDescription")}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <p className="text-sm text-red-800 text-center">
                {t("found", "expiredNotice")}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← {t("scan", "backToHome")}
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            {t("common", "poweredBy")} 📱
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
