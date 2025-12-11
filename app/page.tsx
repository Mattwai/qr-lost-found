export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto p-4 py-16">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center mb-8">
          <div className="text-7xl mb-6">📱</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            QR Lost & Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Never lose your valuables again. Smart QR codes that help reunite
            you with your items.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="/signup"
              className="px-8 py-4 rounded-xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              🚀 Sign Up Free
            </a>
            <a
              href="/login"
              className="px-8 py-4 rounded-xl font-semibold text-purple-600 text-lg bg-white hover:bg-purple-50 transition-all shadow-lg border-2 border-purple-600"
            >
              📊 Login to Dashboard
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/scan"
              className="px-6 py-3 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
            >
              📷 Scan QR Code
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏷️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                1. Register
              </h3>
              <p className="text-gray-600">
                Attach a QR code to your item and register it with your contact
                details
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2. Scan</h3>
              <p className="text-gray-600">
                If someone finds your item, they simply scan the QR code with
                their camera or phone
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                3. Reunite
              </h3>
              <p className="text-gray-600">
                Get notified and pick up your item from a secure drop-off
                location
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔒</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Privacy Protected
                </h3>
                <p className="text-gray-600 text-sm">
                  Your contact details stay hidden until someone reports finding
                  your item
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-3xl mr-4">📍</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Secure Drop-offs
                </h3>
                <p className="text-gray-600 text-sm">
                  Partner locations like libraries and police stations hold
                  items safely
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-3xl mr-4">🔔</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Instant Notifications
                </h3>
                <p className="text-gray-600 text-sm">
                  Get notified immediately when your item is found and dropped
                  off
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-3xl mr-4">⏱️</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  7-Day Pickup Window
                </h3>
                <p className="text-gray-600 text-sm">
                  Items are held securely for 7 days at partner locations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            © 2025 QR Lost & Found. Made to help reunite people with their
            belongings.
          </p>
        </div>
      </div>
    </div>
  );
}
