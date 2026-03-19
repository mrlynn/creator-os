import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { spawn } from 'child_process';
import { z } from 'zod';

export const maxDuration = 300;

const PullSchema = z.object({
  model: z.string().min(1),
  ollamaPath: z.string().optional(),
});

/** Strip ANSI escape sequences and progress spinners; return a clean error message. */
function sanitizeOllamaOutput(text: string): string {
  const stripped = text
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')
    .replace(/\x1b\][^\x07]*\x07/g, '')
    .replace(/[\u2800-\u28FF]/g, '') // Braille patterns (spinner frames)
    .trim();
  const errorLine = stripped.split(/\n/).find((line) => line.includes('Error:'));
  return (errorLine || stripped).replace(/\s+/g, ' ').trim();
}

/**
 * POST /api/settings/ollama-pull
 * Runs `ollama pull <model>` to download the model. Only works when Ollama CLI
 * is available (local dev). Fails gracefully on Vercel/serverless.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = PullSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { model, ollamaPath } = parseResult.data;
    const executable =
      ollamaPath?.trim() ||
      process.env.OLLAMA_CLI_PATH?.trim() ||
      'ollama';

    const pullCommand = `${executable} pull ${model}`;

    return new Promise<NextResponse>((resolve) => {
      const proc = spawn(executable, ['pull', model], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (d) => { stdout += d.toString(); });
      proc.stderr?.on('data', (d) => { stderr += d.toString(); });

      proc.on('error', (err) => {
        const msg = err.message || String(err);
        const isNotFound = msg.includes('ENOENT') || msg.includes('not found');
        resolve(
          NextResponse.json(
            {
              success: false,
              message: isNotFound
                ? `Ollama CLI not found. Run in your terminal: ${pullCommand}`
                : `Failed to run ollama: ${msg}`,
              command: pullCommand,
            },
            { status: 500 }
          )
        );
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(
            NextResponse.json({
              success: true,
              message: `Model ${model} pulled successfully`,
            })
          );
        } else {
          const raw = (stderr || stdout || '').trim();
          const message = sanitizeOllamaOutput(raw) || `ollama pull exited with code ${code}`;
          resolve(
            NextResponse.json(
              {
                success: false,
                message,
                command: pullCommand,
              },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ollama pull error:', error);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
