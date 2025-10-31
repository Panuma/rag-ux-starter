/**
 * Zod схемы для валидации данных
 */

import { z } from "zod";

export const ModeSchema = z.enum(["online", "offline"]);
export const QueryTypeSchema = z.enum(["text", "image"]);

export const QuoteMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  iteration: z.string(),
  date: z.string(),
  filename: z.string(),
  section_path: z.string(),
  chunk_index: z.number(),
  product: z.string(),
});

export const QuoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  metadata: QuoteMetadataSchema,
  distance: z.number().optional(),
});

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  iteration: z.string(),
});

export const ImageSchema = z.object({
  path: z.string(),
  alt: z.string().optional(),
  source_id: z.string(),
});

export const SearchRequestSchema = z.object({
  mode: ModeSchema,
  queryType: QueryTypeSchema,
  query: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
  filters: z.object({
    iteration: z.string().optional(),
    scenario: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
});

export const SearchResponseSchema = z.object({
  summary: z.string(),
  quotes: z.array(QuoteSchema),
  sources: z.array(SourceSchema),
  images: z.array(ImageSchema),
});

export const FollowupRequestSchema = z.object({
  threadId: z.string(),
  query: z.string(),
});

export const FollowupResponseSchema = SearchResponseSchema.extend({
  threadId: z.string(),
  answerId: z.string(),
});

export const AnswerResponseSchema = SearchResponseSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  mode: ModeSchema,
});


