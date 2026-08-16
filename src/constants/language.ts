export const SUPPORTED_NATIVE_LANGUAGES = [
  { code: "tr", name: "Türkçe", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "İngilizce", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "Almanca", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "İspanyolca", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Fransızca", nativeName: "Français", flag: "🇫🇷" },
  { code: "it", name: "İtalyanca", nativeName: "Italiano", flag: "🇮🇹" },

  { code: "ja", name: "Japonca", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korece", nativeName: "한국어", flag: "🇰🇷" },
  {
    code: "zh",
    name: "Çince (Basitleştirilmiş)",
    nativeName: "中文 (简体)",
    flag: "🇨🇳",
  },

  { code: "ru", name: "Rusça", nativeName: "Русский", flag: "🇷🇺" },
  { code: "pt", name: "Portekizce", nativeName: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Felemenkçe", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Lehçe", nativeName: "Polski", flag: "🇵🇱" },
  { code: "el", name: "Yunanca", nativeName: "Ελληνικά", flag: "🇬🇷" },

  { code: "sv", name: "İsveççe", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "no", name: "Norveççe", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "da", name: "Danca", nativeName: "Dansk", flag: "🇩🇰" },
  { code: "fi", name: "Fince", nativeName: "Suomi", flag: "🇫🇮" },

  { code: "ar", name: "Arapça", nativeName: "العربية", flag: "🇸🇦" },
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
