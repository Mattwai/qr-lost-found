"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LanguageSwitch from "../components/languageSwitchButton";
import { extractQRCode, encodeQRForURL } from "@/lib/qr-utils";

export default function ScanPage() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Initialize code reader
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      // Cleanup
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });

      setHasPermission(true);

      if (videoRef.current && codeReaderRef.current) {
        // Start video stream
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start scanning
        codeReaderRef.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err) => {
            if (result) {
              const rawQrCode = result.getText();
              console.log("Raw QR Code detected:", rawQrCode);

              // Extract clean QR code
              const cleanQrCode = extractQRCode(rawQrCode);
              console.log("Extracted QR Code:", cleanQrCode);

              if (cleanQrCode) {
                // Stop scanning
                stopScanning();

                // Navigate to found page with clean QR code
                router.push(`/found?qr=${encodeQRForURL(cleanQrCode)}`);
              } else {
                console.error("Could not extract valid QR code from:", rawQrCode);
                setError(t("found", "invalidQRFormat"));
              }
            }

            if (err && !(err.name === "NotFoundException")) {
              console.error("Scan error:", err);
            }
          }
        );
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setScanning(false);

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(t("scan", "cameraPermissionDenied"));
        } else if (err.name === "NotFoundError") {
          setError(t("scan", "noCameraFound"));
        } else {
          setError(t("scan", "cameraAccessError") + " " + err.message);
        }
      }
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  const handleManualEntry = () => {
    const code = prompt(t("scan", "manualEntryPrompt"));
    if (code) {
      const cleanQrCode = extractQRCode(code);
      if (cleanQrCode) {
        router.push(`/found?qr=${encodeQRForURL(cleanQrCode)}`);
      } else {
        setError(t("found", "invalidQRFormat"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6">
          <div className="text-6xl mb-4">📷</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t("scan", "title")}
          </h1>
          <p className="text-gray-600">{t("scan", "subtitle")}</p>
        </div>

        {/* Camera View */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {!scanning && hasPermission === null && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📱</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {t("scan", "readyToScan")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("scan", "cameraPermission")}
              </p>
              <button
                onClick={startScanning}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg"
              >
                {t("scan", "startScanning")}
              </button>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {t("scan", "cameraAccessNeeded")}
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={startScanning}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  {t("scan", "tryAgain")}
                </button>
                <button
                  onClick={handleManualEntry}
                  className="w-full py-3 rounded-xl font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all"
                >
                  {t("scan", "enterManually")}
                </button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                playsInline
                autoPlay
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-blue-500 rounded-lg w-64 h-64 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 mb-4">{t("scan", "positionQR")}</p>
                <button
                  onClick={stopScanning}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all"
                >
                  {t("scan", "stopScanning")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">
            💡 {t("scan", "tipsTitle")}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• {t("scan", "tipWellLit")}</li>
            <li>• {t("scan", "tipHoldSteady")}</li>
            <li>• {t("scan", "tipKeepInFrame")}</li>
            <li>• {t("scan", "tipAvoidReflections")}</li>
            <li>• {t("scan", "tipManualEntry")}</li>
          </ul>
        </div>

        {/* Alternative Options */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleManualEntry}
            className="w-full py-4 rounded-xl font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all shadow-lg"
          >
            {t("scan", "enterManually")}
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            ← {t("scan", "backToHome")}
          </button>
        </div>

        {/* Browser Compatibility Notice */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-800 text-center">
            ℹ️ {t("scan", "compatibilityNotice")}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">{t("scan", "poweredBy")} 📱</p>
        </div>
      </div>
    </div>
  );
}
