#!/usr/bin/env node
/**
 * One-off script: Set AppConfig LLM to Ollama with qwen3.5:35b
 * Run: node --env-file=.env.local scripts/set-ollama-config.mjs
 * Or: MONGODB_URI=... node scripts/set-ollama-config.mjs
 */

import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Load .env.local if MONGODB_URI not set
if (!process.env.MONGODB_URI) {
  for (const f of ['.env.local', '.env']) {
    const p = resolve(projectRoot, f);
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^MONGODB_URI=(.+)$/);
        if (m) {
          process.env.MONGODB_URI = m[1].trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
      if (process.env.MONGODB_URI) break;
    }
  }
}

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not set. Add to .env.local or pass as env var.');
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const coll = db.collection('appconfigs');

  const result = await coll.findOneAndUpdate(
    {},
    {
      $set: {
        'llm.provider': 'ollama',
        'llm.model': 'qwen3.5:35b',
        'llm.ollamaBaseUrl': 'http://localhost:11434',
        updatedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('✓ AppConfig updated to Ollama with qwen3.5:35b');
  console.log('  llm.provider:', result?.llm?.provider);
  console.log('  llm.model:', result?.llm?.model);
  console.log('  llm.ollamaBaseUrl:', result?.llm?.ollamaBaseUrl);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
