export const SUPPORTED_NATIVE_LANGUAGES = [
  {
    code: "tr",
    nativeName: "Türkçe",
    englishName: "Turkish",
    countryCode: "tr",
  },
  {
    code: "de",
    nativeName: "Deutsch",
    englishName: "German",
    countryCode: "de",
  },
  {
    code: "es",
    nativeName: "Español",
    englishName: "Spanish",
    countryCode: "es",
  },
  {
    code: "fr",
    nativeName: "Français",
    englishName: "French",
    countryCode: "fr",
  },
  {
    code: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    countryCode: "sa",
  },
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
  { code: "en", nativeName: "English", englishName: "English", flag: "🇬🇧" },
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

type UserLanguageCodes = {
  nativeLanguage?: string | null;
  targetLanguage?: string | null;
};

export function getUserLanguageLabels({
  nativeLanguage,
  targetLanguage,
}: UserLanguageCodes) {
  const nativeLang = SUPPORTED_NATIVE_LANGUAGES.find(
    (language) => language.code === nativeLanguage,
  );
  const targetLang = SUPPORTED_TARGET_LANGUAGES.find(
    (language) => language.code === targetLanguage,
  );

  return {
    nativeLangLabel: nativeLang?.nativeName ?? "Native",
    targetLangLabel: targetLang?.nativeName ?? "English",
  };
}

// English display names — used when addressing an AI model, which expects
// language names in English (e.g. "Turkish", "German") rather than endonyms.

export function getNativeLanguageEnglishName(
  code: SupportedNativeLanguageCode,
): string {
  return SUPPORTED_NATIVE_LANGUAGES.find((l) => l.code === code)!.englishName;
}

export function getTargetLanguageEnglishName(
  code: SupportedTargetLanguageCode,
): string {
  return SUPPORTED_TARGET_LANGUAGES.find((l) => l.code === code)!.englishName;
}
