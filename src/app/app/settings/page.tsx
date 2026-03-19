'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StorageIcon from '@mui/icons-material/Storage';
import TuneIcon from '@mui/icons-material/Tune';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface AppConfig {
  llm: { provider: string; model: string; ollamaBaseUrl?: string };
  embeddings: {
    provider: string;
    model: string;
    dimensions: number;
    maxTextChars: number;
    ollamaBaseUrl?: string;
    ollamaCliPath?: string;
  };
  rag: {
    maxTotalChars: number;
    excerptChars: number;
    numCandidatesBase: number;
    numCandidatesMultiplier: number;
  };
  tunables: {
    repurposingMaxScriptChars: number;
    autoTaggerMaxTextChars: number;
    searchDefaultLimit: number;
    searchDefaultMode: string;
    newsResearchCacheHours: number;
  };
  apiKeysConfigured?: { openai: boolean; voyage: boolean };
}

interface PlatformConnection {
  _id: string;
  platform: string;
  platformUserId?: string;
  platformUsername?: string;
  expiresAt?: string;
}

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'o1-preview', label: 'o1 Preview' },
  { value: 'o1-mini', label: 'o1 Mini' },
];

const VOYAGE_EMBEDDING_MODELS = [
  { value: 'voyage-4-large', label: 'Voyage 4 Large (best quality)' },
  { value: 'voyage-4', label: 'Voyage 4' },
  { value: 'voyage-4-lite', label: 'Voyage 4 Lite (fast, low cost)' },
  { value: 'voyage-4-nano', label: 'Voyage 4 Nano (open-weights, via API)' },
];

/** Known embedding models from ollama.com/library. Use exact names for pull. */
const OLLAMA_EMBEDDING_MODELS = [
  { value: 'nomic-embed-text', label: 'nomic-embed-text (768 dims)' },
  { value: 'nomic-embed-text-v2-moe', label: 'nomic-embed-text-v2-moe' },
  { value: 'mxbai-embed-large', label: 'mxbai-embed-large' },
  { value: 'bge-m3', label: 'bge-m3' },
  { value: 'qwen3-embedding', label: 'qwen3-embedding' },
  { value: 'snowflake-arctic-embed', label: 'snowflake-arctic-embed' },
  { value: 'all-minilm', label: 'all-minilm' },
  { value: 'embeddinggemma', label: 'embeddinggemma' },
  { value: 'granite-embedding', label: 'granite-embedding' },
];

export default function SettingsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectLoading, setDisconnectLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configDirty, setConfigDirty] = useState(false);
  const [configForm, setConfigForm] = useState<AppConfig | null>(null);
  const [llmTestLoading, setLlmTestLoading] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [embeddingTestLoading, setEmbeddingTestLoading] = useState(false);
  const [embeddingTestResult, setEmbeddingTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [embeddingPullLoading, setEmbeddingPullLoading] = useState(false);
  const [embeddingPullResult, setEmbeddingPullResult] = useState<{ success: boolean; message: string; command?: string } | null>(null);
  const [embeddingChangeConfirmOpen, setEmbeddingChangeConfirmOpen] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<{ value: string; label: string }[]>([]);
  const [ollamaModelsLoading, setOllamaModelsLoading] = useState(false);
  const [ollamaModelsError, setOllamaModelsError] = useState<string | null>(null);
  const [ollamaEmbeddingModels, setOllamaEmbeddingModels] = useState<{ value: string; label: string }[]>([]);
  const [ollamaEmbeddingModelsLoading, setOllamaEmbeddingModelsLoading] = useState(false);
  const [ollamaEmbeddingModelsError, setOllamaEmbeddingModelsError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          setConfigForm(data);
        }
      } catch {
        setError('Failed to load AI settings');
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const fetchOllamaModels = useCallback(async () => {
    const baseUrl = configForm?.llm.ollamaBaseUrl ?? 'http://localhost:11434';
    setOllamaModelsLoading(true);
    setOllamaModelsError(null);
    try {
      const res = await fetch(`/api/settings/ollama-models?baseUrl=${encodeURIComponent(baseUrl)}`);
      const data = await res.json();
      if (res.ok) {
        setOllamaModels(data.models ?? []);
      } else {
        setOllamaModelsError(data.message ?? data.error ?? 'Could not reach Ollama');
        setOllamaModels([]);
      }
    } catch {
      setOllamaModelsError('Failed to fetch models');
      setOllamaModels([]);
    } finally {
      setOllamaModelsLoading(false);
    }
  }, [configForm?.llm.ollamaBaseUrl]);

  useEffect(() => {
    if (configForm?.llm.provider === 'ollama') {
      fetchOllamaModels();
    } else {
      setOllamaModels([]);
      setOllamaModelsError(null);
    }
  }, [configForm?.llm.provider, configForm?.llm.ollamaBaseUrl, fetchOllamaModels]);

  const fetchOllamaEmbeddingModels = useCallback(async () => {
    const baseUrl = configForm?.embeddings.ollamaBaseUrl ?? 'http://localhost:11434';
    setOllamaEmbeddingModelsLoading(true);
    setOllamaEmbeddingModelsError(null);
    try {
      const res = await fetch(`/api/settings/ollama-models?baseUrl=${encodeURIComponent(baseUrl)}`);
      const data = await res.json();
      if (res.ok) {
        const local = (data.models ?? []).map((m: { value?: string; label?: string; name?: string }) => ({
          value: m.value ?? m.name ?? '',
          label: m.label ?? m.name ?? '',
        })).filter((m: { value: string }) => m.value);
        const presetValues = new Set(OLLAMA_EMBEDDING_MODELS.map((p) => p.value));
        const extra = local.filter((m: { value: string; label: string }) => !presetValues.has(m.value));
        setOllamaEmbeddingModels([...OLLAMA_EMBEDDING_MODELS, ...extra]);
      } else {
        setOllamaEmbeddingModelsError(data.message ?? data.error ?? 'Could not reach Ollama');
        setOllamaEmbeddingModels(OLLAMA_EMBEDDING_MODELS);
      }
    } catch {
      setOllamaEmbeddingModelsError('Failed to fetch models');
      setOllamaEmbeddingModels(OLLAMA_EMBEDDING_MODELS);
    } finally {
      setOllamaEmbeddingModelsLoading(false);
    }
  }, [configForm?.embeddings.ollamaBaseUrl]);

  useEffect(() => {
    if (configForm?.embeddings.provider === 'ollama') {
      fetchOllamaEmbeddingModels();
    } else {
      setOllamaEmbeddingModels([]);
      setOllamaEmbeddingModelsError(null);
    }
  }, [configForm?.embeddings.provider, configForm?.embeddings.ollamaBaseUrl, fetchOllamaEmbeddingModels]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/platform-connections');
        if (res.ok) {
          const data = await res.json();
          setConnections(Array.isArray(data) ? data : []);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.message || err.error || 'Failed to load connections');
        }
      } catch {
        setError('Failed to load connections');
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  useEffect(() => {
    const youtubeConnected = searchParams.get('youtube_connected');
    const youtubeError = searchParams.get('youtube_error');
    const tiktokConnected = searchParams.get('tiktok_connected');
    const tiktokError = searchParams.get('tiktok_error');

    if (youtubeConnected === '1') {
      setSnackbar('YouTube connected successfully');
      setConnections((prev) => {
        if (prev.some((c) => c.platform === 'youtube')) return prev;
        return [...prev, { _id: 'temp', platform: 'youtube' }];
      });
      window.history.replaceState({}, '', '/app/settings');
    }
    if (youtubeError) {
      setError(`YouTube: ${decodeURIComponent(youtubeError)}`);
      window.history.replaceState({}, '', '/app/settings');
    }
    if (tiktokConnected === '1') {
      setSnackbar('TikTok connected successfully');
      setConnections((prev) => {
        if (prev.some((c) => c.platform === 'tiktok')) return prev;
        return [...prev, { _id: 'temp', platform: 'tiktok' }];
      });
      window.history.replaceState({}, '', '/app/settings');
    }
    if (tiktokError) {
      setError(`TikTok: ${decodeURIComponent(tiktokError)}`);
      window.history.replaceState({}, '', '/app/settings');
    }
  }, [searchParams]);

  const handleDisconnect = async (platform: string) => {
    setDisconnectLoading(platform);
    setError(null);
    try {
      const res = await fetch(`/api/platform-connections?platform=${platform}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.platform !== platform));
        setSnackbar(`${platform === 'youtube' ? 'YouTube' : 'TikTok'} disconnected`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to disconnect ${platform}`);
      }
    } catch {
      setError(`Failed to disconnect ${platform}`);
    } finally {
      setDisconnectLoading(null);
    }
  };

  const youtubeConnected = connections.some((c) => c.platform === 'youtube');
  const tiktokConnected = connections.some((c) => c.platform === 'tiktok');

  const updateNested = (key: keyof AppConfig, field: string, value: unknown) => {
    if (!configForm) return;
    setConfigForm((prev) => {
      if (!prev) return null;
      const nested = prev[key] as Record<string, unknown>;
      return { ...prev, [key]: { ...nested, [field]: value } };
    });
    setConfigDirty(true);
  };

  const embeddingConfigChanged = (): boolean => {
    if (!config || !configForm) return false;
    const e = configForm.embeddings;
    const s = config.embeddings;
    return (
      (e.provider ?? 'voyage') !== (s.provider ?? 'voyage') ||
      (e.model ?? '') !== (s.model ?? '') ||
      (e.dimensions ?? 1024) !== (s.dimensions ?? 1024)
    );
  };

  const performSaveConfig = async () => {
    if (!configForm) return;
    setConfigSaving(true);
    setError(null);
    const embeddingChanged = embeddingConfigChanged();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setConfigForm(data);
        setConfigDirty(false);
        setEmbeddingChangeConfirmOpen(false);
        setSnackbar(
          embeddingChanged
            ? 'Settings saved. Next: recreate Atlas indexes for new dimensions, then re-embed ideas, scripts, and episodes.'
            : 'Settings saved successfully'
        );
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || err.message || 'Failed to save settings');
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!configForm || !configDirty) return;
    if (embeddingConfigChanged()) {
      setEmbeddingChangeConfirmOpen(true);
    } else {
      await performSaveConfig();
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Publishing connections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Connect your YouTube and TikTok accounts to upload videos directly from Creator OS.
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">YouTube</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {youtubeConnected ? 'Connected' : 'Not connected'}
                  </Typography>
                </Box>
                {youtubeConnected ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDisconnect('youtube')}
                    disabled={disconnectLoading === 'youtube'}
                    startIcon={
                      disconnectLoading === 'youtube' ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {disconnectLoading === 'youtube' ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    component={Link}
                    href="/api/auth/youtube/connect"
                    size="small"
                  >
                    Connect YouTube
                  </Button>
                )}
              </Box>

              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">TikTok</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tiktokConnected ? 'Connected' : 'Not connected'}
                  </Typography>
                </Box>
                {tiktokConnected ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDisconnect('tiktok')}
                    disabled={disconnectLoading === 'tiktok'}
                    startIcon={
                      disconnectLoading === 'tiktok' ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {disconnectLoading === 'tiktok' ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    component={Link}
                    href="/api/auth/tiktok/connect"
                    size="small"
                  >
                    Connect TikTok
                  </Button>
                )}
              </Box>
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon fontSize="small" />
            LLM
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure the AI model used for script generation, hooks, SEO, and other AI features.
          </Typography>

          {configLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : configForm ? (
            <Stack spacing={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={configForm.llm.provider}
                  label="Provider"
                  onChange={(e) => updateNested('llm', 'provider', e.target.value)}
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="ollama">Ollama (local)</MenuItem>
                  <MenuItem value="anthropic">Anthropic (coming soon)</MenuItem>
                </Select>
              </FormControl>
              {configForm.llm.provider === 'ollama' && (
                <TextField
                  label="Ollama base URL"
                  size="small"
                  value={configForm.llm.ollamaBaseUrl ?? 'http://localhost:11434'}
                  onChange={(e) => updateNested('llm', 'ollamaBaseUrl', e.target.value)}
                  placeholder="http://localhost:11434"
                  helperText="Ollama server URL. Default: http://localhost:11434"
                  sx={{ maxWidth: 400 }}
                />
              )}
              {configForm.llm.provider === 'ollama' && (
                <Typography variant="caption" color="text.secondary">
                  Models are loaded from your local Ollama. Run <code>ollama pull &lt;model&gt;</code> to add new models.
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={
                      (configForm.llm.provider === 'openai'
                        ? OPENAI_MODELS
                        : ollamaModels
                      ).some((p) => p.value === configForm.llm.model)
                        ? configForm.llm.model
                        : 'other'
                    }
                    label="Model"
                    onChange={(e) => {
                      const v = e.target.value;
                      updateNested('llm', 'model', v === 'other' ? '' : v);
                      setLlmTestResult(null);
                    }}
                    disabled={configForm.llm.provider === 'ollama' && ollamaModelsLoading}
                  >
                    {(configForm.llm.provider === 'openai'
                      ? OPENAI_MODELS
                      : ollamaModels
                    ).map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                    <MenuItem value="other">Other (custom)</MenuItem>
                  </Select>
                </FormControl>
                {configForm.llm.provider === 'ollama' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={fetchOllamaModels}
                    disabled={ollamaModelsLoading}
                    startIcon={
                      ollamaModelsLoading ? (
                        <CircularProgress size={14} />
                      ) : (
                        <RefreshIcon fontSize="small" />
                      )
                    }
                    sx={{ alignSelf: 'center', mt: 0.5 }}
                  >
                    Refresh models
                  </Button>
                )}
              {configForm.llm.provider === 'ollama' && ollamaModelsError && (
                  <Alert severity="warning" onClose={() => setOllamaModelsError(null)} sx={{ flex: '1 1 100%' }}>
                    {ollamaModelsError}
                    <Button size="small" onClick={fetchOllamaModels} sx={{ ml: 1 }}>
                      Retry
                    </Button>
                  </Alert>
                )}
                {(configForm.llm.provider === 'openai'
                  ? OPENAI_MODELS
                  : ollamaModels
                ).some((p) => p.value === configForm.llm.model) ? null : (
                  <TextField
                    label="Custom model ID"
                    size="small"
                    value={configForm.llm.model}
                    onChange={(e) => {
                      updateNested('llm', 'model', e.target.value);
                      setLlmTestResult(null);
                    }}
                    placeholder={
                      configForm.llm.provider === 'ollama'
                        ? 'e.g. llama3.2:70b'
                        : 'e.g. gpt-4-turbo'
                    }
                    helperText={
                      configForm.llm.provider === 'ollama'
                        ? 'Model name from ollama list'
                        : config?.apiKeysConfigured?.openai
                          ? 'OpenAI API key configured'
                          : 'Set OPENAI_API_KEY in .env'
                    }
                    sx={{ maxWidth: 320, flex: 1, minWidth: 180 }}
                  />
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    if (!configForm?.llm.model?.trim()) return;
                    setLlmTestLoading(true);
                    setLlmTestResult(null);
                    try {
                      const res = await fetch('/api/settings/test-llm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          provider: configForm.llm.provider,
                          model: configForm.llm.model.trim(),
                          ...(configForm.llm.provider === 'ollama' && configForm.llm.ollamaBaseUrl
                            ? { ollamaBaseUrl: configForm.llm.ollamaBaseUrl }
                            : {}),
                        }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setLlmTestResult({ success: data.success, message: data.message ?? data.error });
                      } else {
                        setLlmTestResult({ success: false, message: data.message ?? data.error ?? 'Test failed' });
                      }
                    } catch {
                      setLlmTestResult({ success: false, message: 'Request failed' });
                    } finally {
                      setLlmTestLoading(false);
                    }
                  }}
                  disabled={
                    llmTestLoading ||
                    !configForm.llm.model?.trim() ||
                    configForm.llm.provider === 'anthropic'
                  }
                  startIcon={
                    llmTestLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <PlayArrowIcon fontSize="small" />
                    )
                  }
                  sx={{ alignSelf: 'center', mt: 0.5 }}
                >
                  Test
                </Button>
              </Box>
              {llmTestResult && (
                <Alert
                  severity={llmTestResult.success ? 'success' : 'error'}
                  onClose={() => setLlmTestResult(null)}
                  sx={{ mt: 0 }}
                >
                  {llmTestResult.message}
                </Alert>
              )}
            </Stack>
          ) : null}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon fontSize="small" />
            Embeddings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Embedding model for semantic search and RAG. Voyage 4 series (shared embedding space). Ollama for local.
            Dimensions must match Atlas vector indexes (1024 for Voyage, 768 for nomic-embed-text).
            {' '}
            <Link href="https://ollama.com/library?q=embedding" target="_blank" rel="noopener noreferrer">
              Browse embedding models at ollama.com/library
            </Link>
          </Typography>

          {configForm && configDirty && embeddingConfigChanged() && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Embedding model change requires migration
              </Typography>
              <Typography variant="body2" component="span">
                Changing provider, model, or dimensions means: (1) Recreate Atlas vector indexes with the new
                numDimensions, (2) Re-embed all ideas, scripts, and episodes via their detail pages. See docs/runbook/ATLAS_VECTOR_INDEXES.md.
              </Typography>
            </Alert>
          )}

          {configForm && (
            <Stack spacing={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={configForm.embeddings.provider ?? 'voyage'}
                  label="Provider"
                  onChange={(e) => {
                    updateNested('embeddings', 'provider', e.target.value);
                    setEmbeddingTestResult(null);
                  }}
                >
                  <MenuItem value="voyage">Voyage AI (cloud)</MenuItem>
                  <MenuItem value="ollama">Ollama (local)</MenuItem>
                </Select>
              </FormControl>
              {configForm.embeddings.provider === 'ollama' && (
                <>
                  <TextField
                    label="Ollama base URL"
                    size="small"
                    value={configForm.embeddings.ollamaBaseUrl ?? 'http://localhost:11434'}
                    onChange={(e) => updateNested('embeddings', 'ollamaBaseUrl', e.target.value)}
                    placeholder="http://localhost:11434"
                    helperText="Ollama server URL. Use Pull model to download, or run ollama pull &lt;model&gt; in terminal."
                    sx={{ maxWidth: 400 }}
                  />
                  <TextField
                    label="Ollama CLI path (advanced)"
                    size="small"
                    value={configForm.embeddings.ollamaCliPath ?? ''}
                    onChange={(e) => updateNested('embeddings', 'ollamaCliPath', e.target.value)}
                    placeholder="ollama"
                    helperText="Path to ollama executable for Pull model. Leave blank to use PATH. Only works locally (not on Vercel)."
                    sx={{ maxWidth: 400 }}
                  />
                </>
              )}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={
                      (configForm.embeddings.provider === 'ollama'
                        ? (ollamaEmbeddingModels.length ? ollamaEmbeddingModels : OLLAMA_EMBEDDING_MODELS)
                        : VOYAGE_EMBEDDING_MODELS
                      ).some((p) => p.value === configForm.embeddings.model)
                        ? configForm.embeddings.model
                        : 'other'
                    }
                    label="Model"
                    onChange={(e) => {
                      const v = e.target.value;
                      updateNested('embeddings', 'model', v === 'other' ? '' : v);
                      setEmbeddingTestResult(null);
                      if (v === 'nomic-embed-text' || v === 'nomic-embed-text-v2-moe') {
                        updateNested('embeddings', 'dimensions', 768);
                      } else if (v && v.startsWith('voyage-4')) {
                        updateNested('embeddings', 'dimensions', 1024);
                      }
                    }}
                    disabled={configForm.embeddings.provider === 'ollama' && ollamaEmbeddingModelsLoading}
                  >
                    {(configForm.embeddings.provider === 'ollama'
                      ? (ollamaEmbeddingModels.length ? ollamaEmbeddingModels : OLLAMA_EMBEDDING_MODELS)
                      : VOYAGE_EMBEDDING_MODELS
                    ).map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                    <MenuItem value="other">Other (custom)</MenuItem>
                  </Select>
                </FormControl>
                {configForm.embeddings.provider === 'ollama' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={fetchOllamaEmbeddingModels}
                    disabled={ollamaEmbeddingModelsLoading}
                    startIcon={
                      ollamaEmbeddingModelsLoading ? (
                        <CircularProgress size={14} />
                      ) : (
                        <RefreshIcon fontSize="small" />
                      )
                    }
                    sx={{ alignSelf: 'center', mt: 0.5 }}
                  >
                    Refresh
                  </Button>
                )}
                {configForm.embeddings.provider === 'ollama' && ollamaEmbeddingModelsError && (
                  <Alert severity="warning" onClose={() => setOllamaEmbeddingModelsError(null)} sx={{ flex: '1 1 100%' }}>
                    {ollamaEmbeddingModelsError}
                    <Button size="small" onClick={fetchOllamaEmbeddingModels} sx={{ ml: 1 }}>
                      Retry
                    </Button>
                  </Alert>
                )}
              </Box>
              {(configForm.embeddings.provider === 'ollama'
                ? (ollamaEmbeddingModels.length ? ollamaEmbeddingModels : OLLAMA_EMBEDDING_MODELS)
                : VOYAGE_EMBEDDING_MODELS
              ).some((p) => p.value === configForm.embeddings.model)
                ? null
                : (
                  <TextField
                    label="Custom model ID"
                    size="small"
                    value={configForm.embeddings.model}
                    onChange={(e) => updateNested('embeddings', 'model', e.target.value)}
                    placeholder={
                      configForm.embeddings.provider === 'ollama'
                        ? 'e.g. nomic-embed-text'
                        : 'e.g. voyage-4-large'
                    }
                    sx={{ maxWidth: 320 }}
                  />
                )}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                  <TextField
                    label="Dimensions"
                    size="small"
                    type="number"
                    value={configForm.embeddings.dimensions}
                    onChange={(e) => {
                      updateNested('embeddings', 'dimensions', parseInt(e.target.value, 10) || 1024);
                      setEmbeddingTestResult(null);
                    }}
                    inputProps={{ min: 256, max: 4096 }}
                    helperText="1024 for Voyage 4, 768 for nomic-embed-text. Must match Atlas index."
                    sx={{ minWidth: 120 }}
                  />
                  <TextField
                    label="Max text chars"
                    size="small"
                    type="number"
                    value={configForm.embeddings.maxTextChars}
                    onChange={(e) => updateNested('embeddings', 'maxTextChars', parseInt(e.target.value, 10) || 8000)}
                    inputProps={{ min: 100, max: 50000 }}
                    sx={{ minWidth: 140 }}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    if (!configForm?.embeddings.model?.trim()) return;
                    setEmbeddingTestLoading(true);
                    setEmbeddingTestResult(null);
                    try {
                      const res = await fetch('/api/settings/test-embeddings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          provider: configForm.embeddings.provider ?? 'voyage',
                          model: configForm.embeddings.model.trim(),
                          dimensions: configForm.embeddings.dimensions ?? 1024,
                          ...(configForm.embeddings.provider === 'ollama' && configForm.embeddings.ollamaBaseUrl
                            ? { ollamaBaseUrl: configForm.embeddings.ollamaBaseUrl }
                            : {}),
                        }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setEmbeddingTestResult({ success: data.success, message: data.message ?? data.error });
                      } else {
                        setEmbeddingTestResult({ success: false, message: data.message ?? data.error ?? 'Test failed' });
                      }
                    } catch {
                      setEmbeddingTestResult({ success: false, message: 'Request failed' });
                    } finally {
                      setEmbeddingTestLoading(false);
                    }
                  }}
                  disabled={embeddingTestLoading || !configForm.embeddings.model?.trim()}
                  startIcon={
                    embeddingTestLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <PlayArrowIcon fontSize="small" />
                    )
                  }
                  sx={{ alignSelf: 'center', mt: 0.5 }}
                >
                  Test
                </Button>
                {configForm.embeddings.provider === 'ollama' && configForm.embeddings.model?.trim() && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={async () => {
                      const model = configForm?.embeddings.model?.trim();
                      if (!model) return;
                      setEmbeddingPullLoading(true);
                      setEmbeddingPullResult(null);
                      try {
                        const res = await fetch('/api/settings/ollama-pull', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            model,
                            ollamaPath: configForm?.embeddings.ollamaCliPath?.trim() || undefined,
                          }),
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          setEmbeddingPullResult({ success: true, message: data.message ?? 'Model pulled' });
                          setEmbeddingTestResult(null);
                        } else {
                          setEmbeddingPullResult({
                            success: false,
                            message: data.message ?? data.error ?? 'Pull failed',
                            command: data.command,
                          });
                        }
                      } catch {
                        setEmbeddingPullResult({ success: false, message: 'Request failed' });
                      } finally {
                        setEmbeddingPullLoading(false);
                      }
                    }}
                    disabled={embeddingPullLoading || !configForm.embeddings.model?.trim()}
                    startIcon={
                      embeddingPullLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <DownloadIcon fontSize="small" />
                      )
                    }
                    sx={{ alignSelf: 'center', mt: 0.5 }}
                  >
                    Pull model
                  </Button>
                )}
              </Box>
              {embeddingTestResult && (
                <Alert
                  severity={embeddingTestResult.success ? 'success' : 'error'}
                  onClose={() => setEmbeddingTestResult(null)}
                  sx={{ mt: 0 }}
                >
                  {embeddingTestResult.message}
                </Alert>
              )}
              {embeddingPullResult && (
                <Alert
                  severity={embeddingPullResult.success ? 'success' : 'error'}
                  onClose={() => setEmbeddingPullResult(null)}
                  sx={{ mt: 0 }}
                >
                  {embeddingPullResult.message}
                  {embeddingPullResult.command && !embeddingPullResult.success && (
                    <Typography component="div" variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      Run in terminal: {embeddingPullResult.command}
                    </Typography>
                  )}
                </Alert>
              )}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon fontSize="small" />
            RAG
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Retrieval-augmented generation: how much context to inject into AI prompts from past content.
          </Typography>

          {configForm && (
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap">
              <TextField
                label="Max total chars"
                size="small"
                type="number"
                value={configForm.rag.maxTotalChars}
                onChange={(e) => updateNested('rag', 'maxTotalChars', parseInt(e.target.value, 10) || 1500)}
                inputProps={{ min: 100, max: 10000 }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="Excerpt chars"
                size="small"
                type="number"
                value={configForm.rag.excerptChars}
                onChange={(e) => updateNested('rag', 'excerptChars', parseInt(e.target.value, 10) || 200)}
                inputProps={{ min: 50, max: 1000 }}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Num candidates base"
                size="small"
                type="number"
                value={configForm.rag.numCandidatesBase}
                onChange={(e) => updateNested('rag', 'numCandidatesBase', parseInt(e.target.value, 10) || 100)}
                inputProps={{ min: 10, max: 500 }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="Num candidates multiplier"
                size="small"
                type="number"
                value={configForm.rag.numCandidatesMultiplier}
                onChange={(e) => updateNested('rag', 'numCandidatesMultiplier', parseInt(e.target.value, 10) || 20)}
                inputProps={{ min: 5, max: 100 }}
                sx={{ minWidth: 160 }}
              />
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon fontSize="small" />
            Other tunables
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Feature-specific limits and search defaults.
          </Typography>

          {configForm && (
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap">
              <TextField
                label="Repurposing max script chars"
                size="small"
                type="number"
                value={configForm.tunables.repurposingMaxScriptChars}
                onChange={(e) => updateNested('tunables', 'repurposingMaxScriptChars', parseInt(e.target.value, 10) || 4000)}
                inputProps={{ min: 500, max: 20000 }}
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="Auto-tagger max text chars"
                size="small"
                type="number"
                value={configForm.tunables.autoTaggerMaxTextChars}
                onChange={(e) => updateNested('tunables', 'autoTaggerMaxTextChars', parseInt(e.target.value, 10) || 500)}
                inputProps={{ min: 100, max: 5000 }}
                sx={{ minWidth: 180 }}
              />
              <TextField
                label="Search default limit"
                size="small"
                type="number"
                value={configForm.tunables.searchDefaultLimit}
                onChange={(e) => updateNested('tunables', 'searchDefaultLimit', parseInt(e.target.value, 10) || 10)}
                inputProps={{ min: 1, max: 50 }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="News research cache (hours)"
                size="small"
                type="number"
                value={configForm.tunables.newsResearchCacheHours ?? 6}
                onChange={(e) => updateNested('tunables', 'newsResearchCacheHours', parseInt(e.target.value, 10) || 6)}
                inputProps={{ min: 1, max: 168 }}
                helperText="How long to cache news/YouTube/TikTok data (1–168 hrs)"
                sx={{ minWidth: 180 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Search default mode</InputLabel>
                <Select
                  value={configForm.tunables.searchDefaultMode}
                  label="Search default mode"
                  onChange={(e) => updateNested('tunables', 'searchDefaultMode', e.target.value)}
                >
                  <MenuItem value="vector">Vector</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </Paper>

        {configDirty && configForm && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSaveConfig}
              disabled={configSaving}
              startIcon={configSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {configSaving ? 'Saving...' : 'Save AI settings'}
            </Button>
            <Button variant="outlined" onClick={() => { if (config) { setConfigForm(config); setConfigDirty(false); } }} disabled={configSaving}>
              Reset
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={embeddingChangeConfirmOpen} onClose={() => setEmbeddingChangeConfirmOpen(false)}>
        <DialogTitle>Confirm embedding model change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Changing the embedding model has significant implications:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>
              <strong>Dimensions may change</strong> — Atlas vector indexes must be recreated with the new numDimensions.
            </li>
            <li>
              <strong>Existing embeddings are invalid</strong> — All ideas, scripts, and episodes must be re-embedded.
            </li>
            <li>
              <strong>Re-embed workflow</strong> — Open each idea, script, and episode detail page and run the embed action (or use the embed API).
            </li>
          </Box>
          <DialogContentText sx={{ mt: 2 }}>
            See docs/runbook/ATLAS_VECTOR_INDEXES.md for index definitions. Continue saving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmbeddingChangeConfirmOpen(false)}>Cancel</Button>
          <Button onClick={performSaveConfig} variant="contained" disabled={configSaving}>
            {configSaving ? 'Saving...' : 'Save anyway'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
