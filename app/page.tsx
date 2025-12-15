"use client";

import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitch from "./components/languageSwitchButton";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto p-4 py-16">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center mb-8 relative">
          <div className="absolute top-4 right-4">
            <LanguageSwitch />
          </div>
          <div className="text-7xl mb-6">📱</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t("home", "title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t("home", "subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="/login"
              className="px-8 py-4 rounded-xl font-semibold text-white text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg"
            >
              📊 {t("home", "login")}
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/scan"
              className="px-6 py-3 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
            >
              📷 {t("home", "scan")}
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {t("homeAbout", "title")}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏷️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                1. {t("homeAbout", "subtitle1")}
              </h3>
              <p className="text-gray-600">
                {t("homeAbout", "description1")}
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2. {t("homeAbout", "subtitle2")}</h3>
              <p className="text-gray-600">
                {t("homeAbout", "description2")}
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                3. {t("homeAbout", "subtitle3")}
              </h3>
              <p className="text-gray-600">
                {t("homeAbout", "description3")}
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {t("features", "title")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔒</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {t("features", "privacyProtected")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("features", "privacyProtectedDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-3xl mr-4">📍</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {t("features", "secureDropoffs")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("features", "secureDropoffsDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-3xl mr-4">🔔</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {t("features", "instantNotifications")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("features", "instantNotificationsDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-3xl mr-4">⏱️</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {t("features", "sevenDayPickup")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("features", "sevenDayPickupDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            {t("common", "copyright")}
          </p>
        </div>
      </div>
    </div>
  );
}
