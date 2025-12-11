"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useRouter } from "next/navigation";

export default function ScanPage() {
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
              const qrCode = result.getText();
              console.log("QR Code detected:", qrCode);

              // Stop scanning
              stopScanning();

              // Navigate to found page
              router.push(`/found?qr=${qrCode}`);
            }

            if (err && !(err.name === "NotFoundException")) {
              console.error("Scan error:", err);
            }
          },
        );
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setScanning(false);

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera permission denied. Please allow camera access to scan QR codes.",
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError("Error accessing camera: " + err.message);
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
    const code = prompt("Enter QR code manually:");
    if (code) {
      router.push(`/found?qr=${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6">
          <div className="text-6xl mb-4">📷</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Scan QR Code
          </h1>
          <p className="text-gray-600">
            Point your camera at a QR code to scan it
          </p>
        </div>

        {/* Camera View */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {!scanning && hasPermission === null && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📱</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Ready to Scan
              </h2>
              <p className="text-gray-600 mb-6">
                We&apos;ll need access to your camera to scan QR codes.
              </p>
              <button
                onClick={startScanning}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg"
              >
                Start Scanning
              </button>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Camera Access Needed
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={startScanning}
                  className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={handleManualEntry}
                  className="w-full py-3 rounded-xl font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all"
                >
                  Enter Code Manually
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
                <p className="text-gray-600 mb-4">
                  Position the QR code within the frame
                </p>
                <button
                  onClick={stopScanning}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all"
                >
                  Stop Scanning
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">💡 Tips for Scanning</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Make sure the QR code is well-lit</li>
            <li>• Hold your phone steady</li>
            <li>• Keep the QR code within the frame</li>
            <li>• Avoid reflections on glossy surfaces</li>
            <li>• If scanning fails, try entering the code manually</li>
          </ul>
        </div>

        {/* Alternative Options */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleManualEntry}
            className="w-full py-4 rounded-xl font-semibold text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all shadow-lg"
          >
            Enter Code Manually
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            ← Back to Home
          </button>
        </div>

        {/* Browser Compatibility Notice */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-800 text-center">
            ℹ️ Camera access works on modern browsers (Chrome, Safari, Edge,
            Firefox). Make sure to allow camera permissions when prompted.
          </p>
        </div>

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
