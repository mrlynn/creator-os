import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { AppConfig } from '@/lib/db/models/AppConfig';
import { getAppConfig, clearAppConfigCache } from '@/lib/config/app-config';
import { UpdateAppConfigSchema } from '@/lib/db/schemas';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/settings
 * Returns current AI/LLM/embeddings/RAG config. API keys are never returned.
 */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getAppConfig();

    return NextResponse.json({
      llm: config.llm,
      embeddings: config.embeddings,
      rag: config.rag,
      tunables: config.tunables,
      apiKeysConfigured: {
        openai: !!process.env.OPENAI_API_KEY,
        voyage: !!process.env.VOYAGE_API_KEY,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Updates AI/LLM/embeddings/RAG config with partial payload.
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = UpdateAppConfigSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (parseResult.data.llm) {
      if (parseResult.data.llm.provider !== undefined)
        update['llm.provider'] = parseResult.data.llm.provider;
      if (parseResult.data.llm.model !== undefined)
        update['llm.model'] = parseResult.data.llm.model;
      if (parseResult.data.llm.ollamaBaseUrl !== undefined)
        update['llm.ollamaBaseUrl'] = parseResult.data.llm.ollamaBaseUrl;
    }
    if (parseResult.data.embeddings) {
      if (parseResult.data.embeddings.provider !== undefined)
        update['embeddings.provider'] = parseResult.data.embeddings.provider;
      if (parseResult.data.embeddings.model !== undefined)
        update['embeddings.model'] = parseResult.data.embeddings.model;
      if (parseResult.data.embeddings.dimensions !== undefined)
        update['embeddings.dimensions'] = parseResult.data.embeddings.dimensions;
      if (parseResult.data.embeddings.maxTextChars !== undefined)
        update['embeddings.maxTextChars'] = parseResult.data.embeddings.maxTextChars;
      if (parseResult.data.embeddings.ollamaBaseUrl !== undefined)
        update['embeddings.ollamaBaseUrl'] = parseResult.data.embeddings.ollamaBaseUrl;
      if (parseResult.data.embeddings.ollamaCliPath !== undefined)
        update['embeddings.ollamaCliPath'] = parseResult.data.embeddings.ollamaCliPath;
    }
    if (parseResult.data.rag) {
      if (parseResult.data.rag.maxTotalChars !== undefined)
        update['rag.maxTotalChars'] = parseResult.data.rag.maxTotalChars;
      if (parseResult.data.rag.excerptChars !== undefined)
        update['rag.excerptChars'] = parseResult.data.rag.excerptChars;
      if (parseResult.data.rag.numCandidatesBase !== undefined)
        update['rag.numCandidatesBase'] = parseResult.data.rag.numCandidatesBase;
      if (parseResult.data.rag.numCandidatesMultiplier !== undefined)
        update['rag.numCandidatesMultiplier'] = parseResult.data.rag.numCandidatesMultiplier;
    }
    if (parseResult.data.tunables) {
      if (parseResult.data.tunables.repurposingMaxScriptChars !== undefined)
        update['tunables.repurposingMaxScriptChars'] =
          parseResult.data.tunables.repurposingMaxScriptChars;
      if (parseResult.data.tunables.autoTaggerMaxTextChars !== undefined)
        update['tunables.autoTaggerMaxTextChars'] =
          parseResult.data.tunables.autoTaggerMaxTextChars;
      if (parseResult.data.tunables.searchDefaultLimit !== undefined)
        update['tunables.searchDefaultLimit'] =
          parseResult.data.tunables.searchDefaultLimit;
      if (parseResult.data.tunables.searchDefaultMode !== undefined)
        update['tunables.searchDefaultMode'] =
          parseResult.data.tunables.searchDefaultMode;
      if (parseResult.data.tunables.newsResearchCacheHours !== undefined)
        update['tunables.newsResearchCacheHours'] =
          parseResult.data.tunables.newsResearchCacheHours;
    }

    if (Object.keys(update).length === 0) {
      const config = await getAppConfig();
      return NextResponse.json(config);
    }

    await AppConfig.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    );

    clearAppConfigCache();

    const config = await getAppConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to update settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
