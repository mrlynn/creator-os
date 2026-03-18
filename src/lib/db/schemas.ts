import { z } from 'zod';

// Tag Schemas
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.enum(['topic', 'platform', 'audience', 'format']),
});

export const UpdateTagSchema = CreateTagSchema.partial();

// InstructionProfile Schemas
export const CreateInstructionProfileSchema = z.object({
  name: z.string().min(1).max(100),
  instructionText: z.string().min(1).max(2000),
  applicableOperations: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

export const UpdateInstructionProfileSchema =
  CreateInstructionProfileSchema.partial();

// ContentIdea Schemas
export const CreateIdeaSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  platform: z.enum(['youtube', 'tiktok', 'long-form', 'multi']),
  audience: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']),
  format: z.enum(['tutorial', 'story', 'demo', 'interview', 'other']),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const UpdateIdeaSchema = CreateIdeaSchema.partial().extend({
  status: z.enum(['raw', 'validated', 'scripted', 'published', 'archived']).optional(),
});

// Script Schemas
export const CreateScriptSchema = z.object({
  ideaId: z.string().min(1),
  title: z.string().optional(),
});

export const UpdateScriptSchema = z.object({
  title: z.string().optional(),
  outline: z.string().optional(),
  hook: z.string().optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  demo: z.string().optional(),
  cta: z.string().optional(),
  outro: z.string().optional(),
  status: z.enum(['outline', 'draft', 'final', 'archived']).optional(),
});

export const GenerateScriptSchema = z.object({
  outline: z.string().min(1),
  audience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  profileId: z.string().optional(),
  includeRag: z.boolean().optional(),
  ragLimit: z.number().min(1).max(10).optional(),
});

export const GenerateHooksSchema = z.object({
  scriptContent: z.string().min(1),
  audienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  profileId: z.string().optional(),
  includeRag: z.boolean().optional(),
  ragLimit: z.number().min(1).max(10).optional(),
});

export const RewriteScriptSchema = z.object({
  audience: z.enum(['beginner', 'advanced']),
});

// Episode Schemas
export const CreateEpisodeSchema = z.object({
  ideaId: z.string().min(1),
  scriptId: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  seriesId: z.string().optional(),
  profileId: z.string().optional(),
});

export const UpdateEpisodeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  editingStatus: z.enum(['not-started', 'recording', 'editing', 'done']).optional(),
  publishingStatus: z.enum(['draft', 'scheduled', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
});

// PublishingRecord Schemas
export const CreatePublishingRecordSchema = z.object({
  episodeId: z.string().min(1),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'custom']),
  status: z.enum(['scheduled', 'live', 'processing', 'failed']).optional(),
  publishedUrl: z.string().url().optional(),
  publishedDate: z.string().datetime().optional(),
  scheduledDate: z.string().datetime().optional(),
});

export const UpdatePublishingRecordSchema = CreatePublishingRecordSchema.partial();

// Analytics Schemas
export const CreateAnalyticsSnapshotSchema = z.object({
  episodeId: z.string().min(1),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'overall']),
  snapshotDate: z.string().datetime(),
  viewCount: z.number().nonnegative(),
  likeCount: z.number().nonnegative(),
  commentCount: z.number().nonnegative(),
  shareCount: z.number().nonnegative(),
  watchTimeMinutes: z.number().optional(),
  engagement: z.number().optional(),
  clickThroughRate: z.number().optional(),
});

export const UpdateAnalyticsSnapshotSchema = z.object({
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'overall']).optional(),
  snapshotDate: z.string().datetime().optional(),
  viewCount: z.number().nonnegative().optional(),
  likeCount: z.number().nonnegative().optional(),
  commentCount: z.number().nonnegative().optional(),
  shareCount: z.number().nonnegative().optional(),
  watchTimeMinutes: z.number().optional(),
  engagement: z.number().optional(),
  clickThroughRate: z.number().optional(),
});

// Prompt Schemas
export const CreatePromptSchema = z.object({
  name: z.string().min(1).max(255),
  template: z.string().min(1).max(50000),
  category: z.string().max(100).optional(),
});

export const UpdatePromptSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  template: z.string().min(1).max(50000).optional(),
  category: z.string().max(100).optional(),
});

// Series Schemas
export const CreateSeriesSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const UpdateSeriesSchema = CreateSeriesSchema.partial().extend({
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

// Export types
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
export type CreateInstructionProfileInput = z.infer<
  typeof CreateInstructionProfileSchema
>;
export type UpdateInstructionProfileInput = z.infer<
  typeof UpdateInstructionProfileSchema
>;
export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>;
export type CreateScriptInput = z.infer<typeof CreateScriptSchema>;
export type UpdateScriptInput = z.infer<typeof UpdateScriptSchema>;
export type GenerateScriptInput = z.infer<typeof GenerateScriptSchema>;
export type GenerateHooksInput = z.infer<typeof GenerateHooksSchema>;
export type CreateEpisodeInput = z.infer<typeof CreateEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof UpdateEpisodeSchema>;
export type CreatePublishingRecordInput = z.infer<
  typeof CreatePublishingRecordSchema
>;
export type UpdatePublishingRecordInput = z.infer<
  typeof UpdatePublishingRecordSchema
>;
export type CreateAnalyticsSnapshotInput = z.infer<
  typeof CreateAnalyticsSnapshotSchema
>;
export type UpdateAnalyticsSnapshotInput = z.infer<
  typeof UpdateAnalyticsSnapshotSchema
>;
export type CreatePromptInput = z.infer<typeof CreatePromptSchema>;
export type UpdatePromptInput = z.infer<typeof UpdatePromptSchema>;
export type CreateSeriesInput = z.infer<typeof CreateSeriesSchema>;
export type UpdateSeriesInput = z.infer<typeof UpdateSeriesSchema>;
