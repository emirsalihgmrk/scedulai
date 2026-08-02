import * as cheerio from "cheerio";

export interface TedTalkData {
  url: string;
  id: string;
  title: string;
  speaker: string;
  description: string;
  durationSeconds: number;
  thumbnailUrl: string;
  publishedAt: string;
  nativeLanguage: string;
  transcript: string;
}

type JsonRecord = Record<string, unknown>;

interface TranscriptCue {
  text?: unknown;
}

interface TranscriptParagraph {
  cues?: unknown;
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown, key: string): JsonRecord | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const nestedValue = value[key];
  return isJsonRecord(nestedValue) ? nestedValue : null;
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getFirstString(...values: unknown[]): string {
  for (const value of values) {
    const stringValue = getString(value).trim();
    if (stringValue.length > 0) {
      return stringValue;
    }
  }

  return "";
}

function getFirstNumber(...values: unknown[]): number {
  for (const value of values) {
    const numberValue = getNumber(value);
    if (numberValue > 0) {
      return numberValue;
    }
  }

  return 0;
}

function getFirstRecord(...values: unknown[]): JsonRecord | null {
  for (const value of values) {
    if (isJsonRecord(value)) {
      return value;
    }
  }

  return null;
}

function parseJsonRecord(value: unknown): JsonRecord | null {
  if (isJsonRecord(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return isJsonRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function validateTedTalkUrl(tedUrl: string): URL | null {
  try {
    const url = new URL(tedUrl);
    const host = url.hostname.toLowerCase();
    const isTedHost = host === "ted.com" || host.endsWith(".ted.com");
    const isTalkPath = url.pathname.startsWith("/talks/");

    return isTedHost && isTalkPath ? url : null;
  } catch {
    return null;
  }
}

export function isTedTalkUrl(tedUrl: string): boolean {
  return validateTedTalkUrl(tedUrl) !== null;
}

export function hasTranscript(
  tedTalkData: TedTalkData | null,
): tedTalkData is TedTalkData {
  return Boolean(tedTalkData?.transcript.trim());
}

export function normalizeTedTalkUrl(tedUrl: string): string {
  const validatedUrl = validateTedTalkUrl(tedUrl);

  if (!validatedUrl) {
    throw new Error(`Invalid TED talk URL: ${tedUrl}`);
  }

  validatedUrl.hash = "";
  validatedUrl.search = "";

  return validatedUrl.toString();
}

function getSpeakerName(
  talk: JsonRecord,
  videoData: JsonRecord | null,
  playerData: JsonRecord | null,
): string {
  const speakers = talk.speakers ?? videoData?.speakers;
  const speakerList = Array.isArray(speakers)
    ? speakers
    : isJsonRecord(speakers) && Array.isArray(speakers.nodes)
      ? (speakers.nodes as unknown[])
      : null;

  if (speakerList && speakerList.length > 0) {
    const names = speakerList
      .map((speaker) => {
        if (typeof speaker === "string") {
          return speaker;
        }

        if (!isJsonRecord(speaker)) {
          return "";
        }

        const firstName = getString(speaker.firstname).trim();
        const lastName = getString(speaker.lastname).trim();
        const fullName = `${firstName} ${lastName}`.trim();

        return getFirstString(speaker.name, fullName, speaker.slug);
      })
      .filter((name) => name.length > 0);

    if (names.length > 0) {
      return names.join(", ");
    }
  }

  return getFirstString(
    talk.speaker,
    talk.presenterDisplayName,
    talk.presenter_display_name,
    talk.speakerName,
    videoData?.speaker,
    videoData?.presenterDisplayName,
    videoData?.presenter_display_name,
    videoData?.speakerName,
    playerData?.speaker,
  );
}

function getThumbnailUrl(
  talk: JsonRecord,
  videoData: JsonRecord | null,
  playerData: JsonRecord | null,
): string {
  const primaryImage =
    getRecord(talk, "primaryImage") ?? getRecord(videoData, "primaryImage");
  const thumbnail =
    getRecord(talk, "thumbnail") ?? getRecord(videoData, "thumbnail");
  const hero = getRecord(talk, "hero") ?? getRecord(videoData, "hero");
  const primaryImageSet = talk.primaryImageSet ?? videoData?.primaryImageSet;
  const primaryImageSetUrl =
    Array.isArray(primaryImageSet) && isJsonRecord(primaryImageSet[0])
      ? primaryImageSet[0].url
      : "";

  return getFirstString(
    talk.thumbnailUrl,
    talk.thumbnail_url,
    talk.image,
    talk.photoUrl,
    videoData?.thumbnailUrl,
    videoData?.thumbnail_url,
    videoData?.image,
    videoData?.photoUrl,
    primaryImage?.url,
    thumbnail?.url,
    hero?.url,
    primaryImageSetUrl,
    playerData?.thumb,
  );
}

function getTranscriptText(transcript: JsonRecord | null): string {
  const paragraphs = transcript?.paragraphs;

  if (!Array.isArray(paragraphs)) {
    return "";
  }

  return paragraphs
    .flatMap((paragraph: TranscriptParagraph) => {
      if (!isJsonRecord(paragraph) || !Array.isArray(paragraph.cues)) {
        return [];
      }

      return paragraph.cues
        .map((cue: TranscriptCue) => {
          if (!isJsonRecord(cue)) {
            return "";
          }

          return getString(cue.text).trim();
        })
        .filter((text) => text.length > 0);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPageProps(nextData: JsonRecord): JsonRecord | null {
  return getRecord(getRecord(nextData, "props"), "pageProps");
}

function getTranscript(
  pageProps: JsonRecord,
  videoData: JsonRecord | null,
): JsonRecord | null {
  const transcriptData = getRecord(pageProps, "transcriptData");

  return (
    getRecord(pageProps, "transcript") ??
    getRecord(videoData, "transcript") ??
    getRecord(transcriptData, "translation")
  );
}

function getPublishedAt(...values: unknown[]): string {
  for (const value of values) {
    const stringValue = getString(value).trim();
    if (stringValue.length > 0) {
      return stringValue;
    }

    const numberValue = getNumber(value);
    if (numberValue > 0) {
      return new Date(numberValue * 1000).toISOString();
    }
  }

  return "";
}

export async function fetchTedTalkData(
  tedUrl: string,
): Promise<TedTalkData | null> {
  const validatedUrl = validateTedTalkUrl(tedUrl);

  if (!validatedUrl) {
    console.error(`Invalid TED talk URL: ${tedUrl}`);
    return null;
  }

  try {
    const response = await fetch(validatedUrl.toString(), {
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`TED request failed with status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const nextDataText = $("#__NEXT_DATA__").text();

    if (!nextDataText) {
      throw new Error("TED __NEXT_DATA__ script tag was not found.");
    }

    const nextData: unknown = JSON.parse(nextDataText);
    if (!isJsonRecord(nextData)) {
      throw new Error("TED __NEXT_DATA__ JSON root is not an object.");
    }

    const pageProps = getPageProps(nextData);
    if (!pageProps) {
      throw new Error("TED pageProps could not be found.");
    }

    const videoData = getRecord(pageProps, "videoData");
    const playerData =
      parseJsonRecord(videoData?.playerData) ??
      parseJsonRecord(videoData?.acmePlayerData);
    const talk =
      getFirstRecord(
        pageProps.talk,
        videoData?.talk,
        videoData,
        pageProps.video,
        playerData,
      ) ?? pageProps;
    const transcript = getTranscript(pageProps, videoData);

    const id = getFirstString(
      talk.id,
      videoData?.id,
      playerData?.id,
      talk.slug,
      validatedUrl.pathname,
    );
    const title = getFirstString(
      talk.title,
      videoData?.title,
      playerData?.title,
    );
    const speaker = getSpeakerName(talk, videoData, playerData);

    return {
      url: normalizeTedTalkUrl(tedUrl),
      id,
      title,
      speaker,
      description: getFirstString(
        talk.description,
        talk.shortDescription,
        talk.short_description,
        videoData?.description,
        videoData?.shortDescription,
        videoData?.short_description,
        videoData?.socialDescription,
      ),
      durationSeconds: getFirstNumber(
        talk.duration,
        talk.durationSeconds,
        talk.duration_seconds,
        videoData?.duration,
        videoData?.durationSeconds,
        videoData?.duration_seconds,
        playerData?.duration,
      ),
      thumbnailUrl: getThumbnailUrl(talk, videoData, playerData),
      publishedAt: getPublishedAt(
        talk.publishedAt,
        talk.published_at,
        talk.recordedOn,
        talk.recorded_on,
        videoData?.publishedAt,
        videoData?.published_at,
        playerData?.published,
      ),
      nativeLanguage:
        getFirstString(
          transcript?.languageCode,
          transcript?.language_code,
          transcript?.languageName,
          transcript?.language_name,
          talk.nativeLanguage,
          talk.native_language,
          videoData?.nativeLanguage,
          videoData?.native_language,
          videoData?.internalLanguageCode,
          playerData?.nativeLanguage,
        ) || "en",
      transcript: getTranscriptText(transcript),
    };
  } catch (error) {
    console.error("Failed to fetch TED talk data:", error);
    return null;
  }
}

interface TedTalkListItem {
  canonicalUrl?: unknown;
  slug?: unknown;
}

export async function fetchTedTalkUrlsFromPage(page: number): Promise<string[]> {
  try {
    const response = await fetch(`https://www.ted.com/talks?page=${page}`, {
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const nextDataText = $("#__NEXT_DATA__").text();
    if (!nextDataText) return [];

    const nextData: unknown = JSON.parse(nextDataText);
    if (!isJsonRecord(nextData)) return [];

    const pageProps = getPageProps(nextData);
    const talks = pageProps?.talks;
    if (!Array.isArray(talks)) return [];

    const seen = new Set<string>();
    const urls: string[] = [];

    for (const talk of talks as TedTalkListItem[]) {
      const rawUrl = getString(talk.canonicalUrl).trim();
      const slug = getString(talk.slug).trim();
      const url = rawUrl || (slug ? `https://www.ted.com/talks/${slug}` : "");

      if (!url || seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }

    return urls;
  } catch {
    return [];
  }
}

export async function discoverTedTalk(
  excludeUrls: string[] = [],
): Promise<TedTalkData | null> {
  const excludeSet = new Set(excludeUrls.map((u) => u.toLowerCase()));
  const MAX_PAGES = 150;
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const page = Math.floor(Math.random() * MAX_PAGES) + 1;
    const urls = await fetchTedTalkUrlsFromPage(page);

    const candidates = urls
      .filter((u) => !excludeSet.has(u.toLowerCase()))
      .sort(() => Math.random() - 0.5);

    for (const candidateUrl of candidates) {
      const data = await fetchTedTalkData(candidateUrl);
      if (hasTranscript(data)) {
        return data;
      }
    }
  }

  return null;
}
