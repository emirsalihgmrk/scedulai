import { z } from "zod";

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

const photoSizeSchema = z.object({
  url: z.string().nullish(),
  aspectRatioName: z.string().nullish(),
});

const speakerSchema = z.object({
  firstname: z.string().nullish(),
  lastname: z.string().nullish(),
});

const cueSchema = z.object({ text: z.string().nullish() });

const paragraphSchema = z.object({ cues: z.array(cueSchema).nullish() });

const translationSchema = z.object({
  paragraphs: z.array(paragraphSchema).nullish(),
});

export type Translation = z.infer<typeof translationSchema>;

const videoSchema = z.object({
  id: z.union([z.string(), z.number()]).nullish(),
  slug: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  duration: z.number().nullish(),
  recordedOn: z.string().nullish(),
  publishedAt: z.string().nullish(),
  presenterDisplayName: z.string().nullish(),
  internalLanguageCode: z.string().nullish(),
  canonicalUrl: z.string().nullish(),
  speakers: z.object({ nodes: z.array(speakerSchema).nullish() }).nullish(),
  primaryImageSet: z.array(photoSizeSchema).nullish(),
});

export type Video = z.infer<typeof videoSchema>;

export const videoResponseSchema = z.object({
  data: z.object({ video: videoSchema.nullish() }).nullish(),
});

export const translationResponseSchema = z.object({
  data: z.object({ translation: translationSchema.nullish() }).nullish(),
});

export const searchResponseSchema = z.object({
  results: z.array(
    z.object({
      hits: z
        .array(
          z.object({
            slug: z.string().nullish(),
            url: z.string().nullish(),
          }),
        )
        .nullish(),
    }),
  ),
});