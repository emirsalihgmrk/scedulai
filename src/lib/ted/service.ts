import { z } from "zod";

import { TRANSLATION_QUERY, VIDEO_QUERY } from "./queries";
import {
  type TedTalkData,
  type Translation,
  type Video,
  searchResponseSchema,
  translationResponseSchema,
  videoResponseSchema,
} from "./schemas";

const GRAPHQL_URL = "https://www.ted.com/graphql";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SORT_INDEX_MAP = {
  popular: "popular",
  newest: "newest",
  oldest: "oldest",
  relevance: "relevance",
} as const;

async function fetchGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  schema: z.ZodType<T>,
): Promise<T | null> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        "User-Agent": USER_AGENT,
        Referer: "https://www.ted.com/talks",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) return null;

    const parsed = schema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
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

function getTalkSlug(url: URL): string {
  return url.pathname.replace(/^\/talks\//, "").replace(/\/.*$/, "").trim();
}

function getSpeakerName(video: Video): string {
  const names = (video.speakers?.nodes ?? [])
    .map((speaker) =>
      `${speaker.firstname ?? ""} ${speaker.lastname ?? ""}`.trim(),
    )
    .filter((name) => name.length > 0);

  return names.join(", ") || video.presenterDisplayName || "";
}

function getThumbnailUrl(video: Video): string {
  const images = video.primaryImageSet ?? [];
  const widescreen = images.find((image) => image.aspectRatioName === "16x9");

  return widescreen?.url ?? images[0]?.url ?? "";
}

function getTranscriptText(
  translation: Translation | null | undefined,
): string {
  return (translation?.paragraphs ?? [])
    .flatMap((paragraph) => paragraph.cues ?? [])
    .map((cue) => cue.text?.trim() ?? "")
    .filter((text) => text.length > 0)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
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
    const slug = getTalkSlug(validatedUrl);

    if (!slug) {
      throw new Error("TED talk slug could not be found.");
    }

    const videoResponse = await fetchGraphql(
      VIDEO_QUERY,
      { slug },
      videoResponseSchema,
    );
    const video = videoResponse?.data?.video;

    if (!video?.id) {
      throw new Error("TED video data could not be found.");
    }

    const nativeLanguage = video.internalLanguageCode ?? "en";

    const translationResponse = await fetchGraphql(
      TRANSLATION_QUERY,
      { videoId: String(video.id), language: nativeLanguage },
      translationResponseSchema,
    );
    const translation = translationResponse?.data?.translation;

    return {
      url: normalizeTedTalkUrl(tedUrl),
      id: String(video.id),
      title: video.title ?? "",
      speaker: getSpeakerName(video),
      description: video.description ?? "",
      durationSeconds: video.duration ?? 0,
      thumbnailUrl: getThumbnailUrl(video),
      publishedAt: video.publishedAt ?? video.recordedOn ?? "",
      nativeLanguage,
      transcript: getTranscriptText(translation),
    };
  } catch (error) {
    console.error("Failed to fetch TED talk data:", error);
    return null;
  }
}

const HITS_PER_PAGE = 24;

async function fetchTedSearchPage(
  page: number,
  sort: "newest" | "oldest" | "relevance" | "popular" = "popular",
  language: string | null = "english",
): Promise<{ urls: string[]; nbPages: number }> {
  const facetFilters = language ? [[`subtitle_languages:${language}`]] : [];

  const body = [
    {
      indexName: SORT_INDEX_MAP[sort],
      params: {
        attributeForDistinct: "objectID",
        distinct: 1,
        facetFilters,
        facets: ["subtitle_languages", "tags"],
        highlightPostTag: "__/ais-highlight__",
        highlightPreTag: "__ais-highlight__",
        hitsPerPage: HITS_PER_PAGE,
        maxValuesPerFacet: 500,
        page,
        query: "",
      },
    },
  ];

  const response = await fetch("https://www.ted.com/api/search", {
    method: "POST",
    headers: {
      accept: "*/*",
      "content-type": "application/json",
      "User-Agent": USER_AGENT,
      Referer: "https://www.ted.com/talks",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) return { urls: [], nbPages: 0 };

  try {
    const parsed = searchResponseSchema.safeParse(await response.json());
    if (!parsed.success) return { urls: [], nbPages: 0 };

    const result = parsed.data.results[0];
    const hits = result?.hits ?? [];
    const nbPages = result?.nbPages ?? 0;
    const seen = new Set<string>();
    const urls: string[] = [];

    for (const hit of hits) {
      const slug = hit.slug?.trim() ?? "";
      const url =
        hit.url?.trim() || (slug ? `https://www.ted.com/talks/${slug}` : "");

      if (!url || seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }

    return { urls, nbPages };
  } catch {
    return { urls: [], nbPages: 0 };
  }
}

export async function discoverTedTalk(
  excludeUrls: string[] = [],
): Promise<TedTalkData | null> {
  const excludeSet = new Set(excludeUrls.map((u) => u.toLowerCase()));
  const startPage = Math.floor(excludeUrls.length / HITS_PER_PAGE);

  let page = startPage;
  let nbPages = startPage + 1; // updated with the real value after the first fetch

  while (page < nbPages) {
    const { urls, nbPages: total } = await fetchTedSearchPage(page);
    nbPages = total;

    for (const candidateUrl of urls) {
      if (excludeSet.has(candidateUrl.toLowerCase())) continue;

      const data = await fetchTedTalkData(candidateUrl);
      if (hasTranscript(data)) {
        return data;
      }
    }

    page++;
  }

  return null;
}