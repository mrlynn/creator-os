# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Creator OS is a full-stack Next.js 14 platform for AI-powered content creation, designed for developer advocates producing content across YouTube, TikTok, and long-form channels. The platform transforms the content creation workflow from ideas → scripts → episodes → publishing with AI assistance at every stage.

## Architecture & Key Patterns

### Core Content Workflow
The platform follows a linear content progression:
1. **Content Ideas** (`ContentIdea` model) - Raw ideas with platform/audience targeting
2. **Scripts** (`Script` model) - AI-generated structured scripts with sections (hook, problem, solution, demo, CTA, outro)
3. **Episodes** (`Episode` model) - Produced content ready for publishing
4. **Publishing Records** (`PublishingRecord` model) - Platform-specific publication tracking

### Database Architecture
- **MongoDB Atlas** with Mongoose ODM
- Connection managed through singleton pattern in `src/lib/db/connection.ts`
- All models in `src/lib/db/models/` with Zod validation schemas in `src/lib/db/schemas.ts`
- Key collections: ContentIdea, Script, Episode, PublishingRecord, Series, Tag, AnalyticsSnapshot, AiUsageLog

### AI Integration Pattern
- OpenAI client wrapper in `src/lib/ai/openai-client.ts`
- Usage logging for all AI operations in `src/lib/ai/usage-logger.ts`
- Script generation with structured parsing in `src/lib/ai/script-generator.ts`
- All AI functions return `{ success, data/error, tokensUsed, durationMs }` format

### UI Architecture
- Material-UI with custom theme in `src/styles/theme.ts`
- Protected app layout with sidebar navigation in `src/app/(app)/layout.tsx`
- Sidebar width constant exported as `SIDEBAR_WIDTH` from `AppSidebar.tsx`
- Authentication-gated routes using Next-Auth

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Create production build
npm start           # Start production server
npm run lint        # Run ESLint

# Database
# Requires MONGODB_URI environment variable
# Connection auto-established on first database operation
```

## Environment Setup

Required environment variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `OPENAI_API_KEY` - OpenAI API key for script generation
- `NEXTAUTH_SECRET` - NextAuth session secret
- `NEXTAUTH_URL` - Base URL for NextAuth

## Key Development Patterns

### API Route Structure
- Follow Next.js App Router conventions: `src/app/api/[resource]/route.ts`
- Use Zod schemas for request validation
- Implement CRUD operations with proper error handling
- Return consistent JSON responses with status codes

### Database Operations
- Always call `connectToDatabase()` before Mongoose operations
- Use Zod schemas for input validation before database writes
- Implement proper error handling with MongoDB connection retries
- Models auto-import connection, no manual connection needed in route handlers

### AI-Powered Features
- Script generation from outlines with audience-level targeting
- Hook generation for existing scripts
- Usage logging for all AI operations (fire-and-forget pattern)
- Structured content parsing with section extraction

### Component Patterns
- Use Material-UI `Box` for layout containers
- Implement responsive design with `sx` prop patterns
- Theme-aware components using `useTheme()` hook
- Protected routes redirect to `/login` if unauthenticated

## Testing Strategy

No test suite currently exists. When adding tests:
- Focus on API route testing with database mocking
- Test AI integration error handling and token usage tracking
- Validate Zod schema parsing for all input validation
- Component testing for core content creation workflows

## Content Generation Flow

1. **Idea Creation** - User creates ContentIdea with platform/audience targeting
2. **Script Generation** - AI generates structured script from idea outline
3. **Script Refinement** - User can regenerate sections or create hooks
4. **Episode Production** - Script becomes Episode with metadata
5. **Publishing** - Episode distributed to platforms via PublishingRecord tracking

Understanding this workflow is crucial for feature development and debugging content creation issues.