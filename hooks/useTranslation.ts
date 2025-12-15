import { translations, type Language } from "@/constants/translations";
import { useLanguage } from "@/context/languageContext";

export function useTranslation() {
  const { language } = useLanguage();

  function t<
    Section extends keyof typeof translations,
    Key extends keyof (typeof translations)[Section]
  >(section: Section, key: Key): string {
    const translationObject = translations[section][key] as Record<Language, string>;
    return translationObject[language];
  }

  return { t };
}
