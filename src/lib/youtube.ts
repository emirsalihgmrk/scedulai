import { TranscriptLine } from "@/types/video";
import { YoutubeTranscript } from "youtube-transcript";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export interface VideoMeta {
  videoId: string;
  url: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  durationSeconds: number;
  thumbnailUrl: string;
  hasCaptions: boolean;
}

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY ortam değişkeni tanımlanmamış!");
  return key;
}

async function callApi<T>(
  resource: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API_BASE}/${resource}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey());

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `YouTube API ${resource} çağrısı başarısız (${res.status}): ${body}`,
    );
  }
  return res.json() as Promise<T>;
}

// ─── Channel → uploads playlist ─────────────────────────────────────────────

interface ChannelsResponse {
  items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[];
}

/**
 * Resolves a channel (either a `UC...` id or an `@handle`) to its "uploads"
 * playlist id, which contains every public video on the channel.
 */
export async function getUploadsPlaylistId(channel: string): Promise<string> {
  const params: Record<string, string> = { part: "contentDetails" };
  if (channel.startsWith("UC")) {
    params.id = channel;
  } else {
    params.forHandle = channel.startsWith("@") ? channel : `@${channel}`;
  }

  const data = await callApi<ChannelsResponse>("channels", params);
  const uploads = data.items?.[0]?.contentDetails.relatedPlaylists.uploads;
  if (!uploads) throw new Error(`Kanal bulunamadı: ${channel}`);
  return uploads;
}

// ─── Uploads playlist → video ids ───────────────────────────────────────────

interface PlaylistItemsResponse {
  items: { contentDetails: { videoId: string } }[];
  nextPageToken?: string;
}

/** Pages through the uploads playlist collecting up to `limit` video ids. */
export async function listVideoIds(
  uploadsPlaylistId: string,
  limit: number,
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  while (ids.length < limit) {
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: String(Math.min(50, limit - ids.length)),
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await callApi<PlaylistItemsResponse>("playlistItems", params);
    ids.push(...data.items.map((item) => item.contentDetails.videoId));

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return ids.slice(0, limit);
}

// ─── Video ids → metadata ───────────────────────────────────────────────────

interface VideosResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      channelId: string;
      publishedAt: string;
      thumbnails: Record<string, { url: string } | undefined>;
    };
    contentDetails: { duration: string; caption: string };
  }[];
}

interface ChannelSnippetResponse {
  items: {
    id: string;
    snippet: { thumbnails: Record<string, { url: string } | undefined> };
  }[];
}

/** Parses an ISO 8601 duration (e.g. `PT1H2M3S`) into total seconds. */
export function parseIso8601Duration(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

/** Fetches full metadata for the given video ids (batched 50 per request). */
export async function getVideoDetails(
  videoIds: string[],
): Promise<VideoMeta[]> {
  const metas: VideoMeta[] = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await callApi<VideosResponse>("videos", {
      part: "snippet,contentDetails",
      id: batch.join(","),
    });

    for (const item of data.items) {
      const thumb =
        item.snippet.thumbnails.maxres ??
        item.snippet.thumbnails.high ??
        item.snippet.thumbnails.medium ??
        item.snippet.thumbnails.default;
      if (!thumb) throw new Error(`No thumbnail found for video ${item.id}`);

      metas.push({
        videoId: item.id,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        durationSeconds: parseIso8601Duration(item.contentDetails.duration),
        thumbnailUrl: thumb.url,
        hasCaptions: item.contentDetails.caption === "true",
      });
    }
  }

  return metas;
}

// ─── Channel thumbnails ──────────────────────────────────────────────────────

/** Fetches the avatar thumbnail URL for each channel id (batched 50 per request). */
export async function getChannelThumbnails(
  channelIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  for (let i = 0; i < channelIds.length; i += 50) {
    const batch = channelIds.slice(i, i + 50);
    const data = await callApi<ChannelSnippetResponse>("channels", {
      part: "snippet",
      id: batch.join(","),
    });

    for (const item of data.items) {
      const thumb =
        item.snippet.thumbnails.high ??
        item.snippet.thumbnails.medium ??
        item.snippet.thumbnails.default;
      if (thumb) result.set(item.id, thumb.url);
    }
  }

  return result;
}

// ─── Transcript ─────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
  const total = Math.floor(totalSeconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export async function fetchEnglishTranscript(
  videoId: string,
  durationSeconds: number,
): Promise<TranscriptLine[] | null> {
  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    if (raw.length === 0) return null;

    const maxOffset = Math.max(...raw.map((line) => line.offset));
    const looksLikeMs = maxOffset > durationSeconds * 1.5;
    const divisor = looksLikeMs ? 1000 : 1;

    return raw.map((line) => ({
      time: formatTime(line.offset / divisor),
      text: line.text,
    }));
  } catch {
    return null;
  }
}
