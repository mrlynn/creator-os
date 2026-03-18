/**
 * Central models index. Import this (or any model) before DB operations
 * to ensure all models are registered for Mongoose populate().
 */
import './InstructionProfile';
import './ContentIdea';
import './Script';
import './Episode';
import './Series';
import './Tag';
import './PublishingRecord';
import './AnalyticsSnapshot';
import './AiUsageLog';
import './Prompt';
import './PlatformConnection';

export { InstructionProfile } from './InstructionProfile';
export { ContentIdea } from './ContentIdea';
export { Script } from './Script';
export { Episode } from './Episode';
export { Series } from './Series';
export { Tag } from './Tag';
export { PublishingRecord } from './PublishingRecord';
export { AnalyticsSnapshot } from './AnalyticsSnapshot';
export { AiUsageLog } from './AiUsageLog';
export { Prompt } from './Prompt';
export { PlatformConnection } from './PlatformConnection';
