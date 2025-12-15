"use client";

import { useLanguage } from "@/context/languageContext";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "zh" : "en")}
      className="px-4 py-2 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-100 text-black transition-all shadow-sm"
    >
      {language === "en" ? "中文" : "EN"}
    </button>
  );
}
