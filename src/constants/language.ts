export const SUPPORTED_NATIVE_LANGUAGES = [
  { code: "tr", name: "Türkçe", nativeName: "Türkçe", countryCode: "tr" },
  { code: "en", name: "İngilizce", nativeName: "English", countryCode: "gb" },
  { code: "de", name: "Almanca", nativeName: "Deutsch", countryCode: "de" },
  { code: "es", name: "İspanyolca", nativeName: "Español", countryCode: "es" },
  { code: "fr", name: "Fransızca", nativeName: "Français", countryCode: "fr" },
  { code: "it", name: "İtalyanca", nativeName: "Italiano", countryCode: "it" },

  { code: "ja", name: "Japonca", nativeName: "日本語", countryCode: "jp" },
  { code: "ko", name: "Korece", nativeName: "한국어", countryCode: "kr" },
  {
    code: "zh",
    name: "Çince (Basitleştirilmiş)",
    nativeName: "中文 (简体)",
    countryCode: "cn",
  },

  { code: "ru", name: "Rusça", nativeName: "Русский", countryCode: "ru" },
  { code: "pt", name: "Portekizce", nativeName: "Português", countryCode: "pt" },
  { code: "nl", name: "Felemenkçe", nativeName: "Nederlands", countryCode: "nl" },
  { code: "pl", name: "Lehçe", nativeName: "Polski", countryCode: "pl" },
  { code: "el", name: "Yunanca", nativeName: "Ελληνικά", countryCode: "gr" },

  { code: "sv", name: "İsveççe", nativeName: "Svenska", countryCode: "se" },
  { code: "no", name: "Norveççe", nativeName: "Norsk", countryCode: "no" },
  { code: "da", name: "Danca", nativeName: "Dansk", countryCode: "dk" },
  { code: "fi", name: "Fince", nativeName: "Suomi", countryCode: "fi" },

  { code: "ar", name: "Arapça", nativeName: "العربية", countryCode: "sa" },
] as const;

export const SUPPORTED_NATIVE_LANGUAGE_CODES = SUPPORTED_NATIVE_LANGUAGES.map(
  (l) => l.code,
) as [
  (typeof SUPPORTED_NATIVE_LANGUAGES)[number]["code"],
  ...(typeof SUPPORTED_NATIVE_LANGUAGES)[number]["code"][],
];

export type SupportedNativeLanguageCode =
  (typeof SUPPORTED_NATIVE_LANGUAGES)[number]["code"];
export type SupportedNativeLanguage =
  (typeof SUPPORTED_NATIVE_LANGUAGES)[number];

export const SUPPORTED_TARGET_LANGUAGES = [
  { code: "en", name: "İngilizce", nativeName: "English", flag: "🇬🇧" },
] as const;

export const SUPPORTED_TARGET_LANGUAGE_CODES = SUPPORTED_TARGET_LANGUAGES.map(
  (l) => l.code,
) as [
  (typeof SUPPORTED_TARGET_LANGUAGES)[number]["code"],
  ...(typeof SUPPORTED_TARGET_LANGUAGES)[number]["code"][],
];

export type SupportedTargetLanguageCode =
  (typeof SUPPORTED_TARGET_LANGUAGES)[number]["code"];
export type SupportedTargetLanguage =
  (typeof SUPPORTED_TARGET_LANGUAGES)[number];
