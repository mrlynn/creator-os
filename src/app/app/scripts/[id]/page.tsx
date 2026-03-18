'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  Stack,
  Tabs,
  Tab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RefreshIcon from '@mui/icons-material/Refresh';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

type AudienceLevel = 'beginner' | 'advanced';

interface Script {
  _id: string;
  title: string;
  ideaId?: string | { _id: string; audience?: string };
  outline?: string;
  hook?: string;
  problem?: string;
  solution?: string;
  demo?: string;
  cta?: string;
  outro?: string;
  youtubeHooks?: string[];
  tiktokHooks?: string[];
  status: string;
  wordCount: number;
}

interface Series {
  _id: string;
  title: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = params.id as string;

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateCountdown, setGenerateCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [hookTabValue, setHookTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Script>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastTokensUsed, setLastTokensUsed] = useState<number | null>(null);
  const [generatingHooks, setGeneratingHooks] = useState(false);
  const [hookError, setHookError] = useState<string | null>(null);
  const [audience, setAudience] = useState<AudienceLevel>('beginner');
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Episode creation dialog
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [episodeForm, setEpisodeForm] = useState({ title: '', description: '', seriesId: '' });
  const [creatingEpisode, setCreatingEpisode] = useState(false);
  const [episodeError, setEpisodeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const response = await fetch(`/api/scripts/${scriptId}`);
        if (!response.ok) throw new Error('Failed to fetch script');
        const data = await response.json();
        setScript(data);
        setFormData(data);
        const ideaAudience = data.ideaId?.audience;
        if (ideaAudience === 'advanced') setAudience('advanced');
        else if (ideaAudience === 'beginner' || ideaAudience === 'mixed' || ideaAudience === 'intermediate') setAudience('beginner');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [scriptId]);

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series');
      if (response.ok) {
        const { data } = await response.json();
        setSeriesList(data || []);
      }
    } catch {
      // Series list is optional — silently ignore failures
    }
  };

  const handleOpenEpisodeDialog = () => {
    setEpisodeForm({ title: script?.title || '', description: '', seriesId: '' });
    setEpisodeError(null);
    fetchSeries();
    setEpisodeDialogOpen(true);
  };

  const handleCreateEpisode = async () => {
    if (!episodeForm.title.trim()) {
      setEpisodeError('Title is required');
      return;
    }

    const ideaId =
      script?.ideaId && typeof script.ideaId === 'object'
        ? script.ideaId._id
        : script?.ideaId;

    if (!ideaId) {
      setEpisodeError('This script is not linked to an idea. Cannot create episode.');
      return;
    }

    setCreatingEpisode(true);
    setEpisodeError(null);

    try {
      const payload: Record<string, string> = {
        ideaId: ideaId as string,
        scriptId,
        title: episodeForm.title.trim(),
      };
      if (episodeForm.description.trim()) payload.description = episodeForm.description.trim();
      if (episodeForm.seriesId) payload.seriesId = episodeForm.seriesId;

      const response = await fetch('/api/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create episode');
      }

      setEpisodeDialogOpen(false);
      setSuccessMessage('Episode created! Redirecting to pipeline...');
      setTimeout(() => router.push('/app/pipeline'), 1200);
    } catch (err) {
      setEpisodeError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreatingEpisode(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save script');
      const updated = await response.json();
      setScript(updated);
      setSuccessMessage('Script saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleRewrite = async () => {
    setRewriting(true);
    setRewriteError(null);

    try {
      const response = await fetch(`/api/scripts/${scriptId}/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Rewrite failed');
      }

      const result = await response.json();
      const updated = result.script;
      setScript(updated);
      setFormData(updated);
      setLastTokensUsed(result.generation?.tokensUsed || null);
      setSuccessMessage(`Script rewritten for ${audience} audience`);
      setTabValue(1);
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : 'Rewrite failed');
    } finally {
      setRewriting(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.outline) {
      setGenerateError('Please provide an outline first');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setLastTokensUsed(null);

    setGenerateCountdown(40);
    countdownRef.current = setInterval(() => {
      setGenerateCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await fetch(`/api/scripts/${scriptId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline: formData.outline, audience }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Generation failed — check your outline and try again');
      }

      const result = await response.json();
      const updated = result.script;
      const tokensUsed = result.generation?.tokensUsed || null;

      setScript(updated);
      setFormData(updated);
      setLastTokensUsed(tokensUsed);

      const wordCount = updated.wordCount || 0;
      const tokenMsg = tokensUsed ? ` • ${tokensUsed.toLocaleString()} tokens used` : '';
      setSuccessMessage(`Script generated! ${wordCount} words${tokenMsg}`);
      setTabValue(1);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setGenerating(false);
      setGenerateCountdown(0);
    }
  };

  const handleGenerateHooks = async () => {
    if (!script || script.wordCount === 0) {
      setHookError('Please generate a script first before creating hooks');
      return;
    }

    setGeneratingHooks(true);
    setHookError(null);

    try {
      const response = await fetch(`/api/scripts/${scriptId}/hooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptContent: formData.hook || formData.problem || formData.solution || '',
          audienceLevel: 'beginner',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate hooks');
      }

      const result = await response.json();
      const updatedScript = {
        ...script,
        youtubeHooks: result.youtubeHooks,
        tiktokHooks: result.tiktokHooks,
      };

      setScript(updatedScript);
      setFormData(updatedScript);
      setLastTokensUsed(result.generation?.tokensUsed || null);
      setHookTabValue(0); // Show YouTube hooks first

      const tokenMsg = result.generation?.tokensUsed
        ? ` • ${result.generation.tokensUsed.toLocaleString()} tokens used`
        : '';
      setSuccessMessage(`Hooks generated!${tokenMsg}`);
    } catch (err) {
      setHookError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGeneratingHooks(false);
    }
  };

  const handleSaveHooks = async (platform: 'youtube' | 'tiktok') => {
    const hooksField = platform === 'youtube' ? 'youtubeHooks' : 'tiktokHooks';
    const hooksValue = platform === 'youtube' ? formData.youtubeHooks : formData.tiktokHooks;

    if (!hooksValue || hooksValue.length === 0) {
      setError('No hooks to save');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [hooksField]: hooksValue }),
      });

      if (!response.ok) throw new Error('Failed to save hooks');

      setSuccessMessage(`${platform === 'youtube' ? 'YouTube' : 'TikTok'} hooks saved`);
      setTabValue(2); // Stay on hooks tab
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!script) {
    return (
      <Container>
        <Typography color="error">Script not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h3" component="h1">
            {script.title}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<VideoLibraryIcon />}
            onClick={handleOpenEpisodeDialog}
            sx={{ mt: 0.5, flexShrink: 0, ml: 2 }}
          >
            Create Episode
          </Button>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {script.wordCount} words • Status: {script.status}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={5000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={successMessage}
        />

        {/* Create Episode Dialog */}
        <Dialog open={episodeDialogOpen} onClose={() => setEpisodeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Episode</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {episodeError && <Alert severity="error">{episodeError}</Alert>}
              <TextField
                label="Title"
                required
                fullWidth
                value={episodeForm.title}
                onChange={(e) => setEpisodeForm((p) => ({ ...p, title: e.target.value }))}
                autoFocus
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={episodeForm.description}
                onChange={(e) => setEpisodeForm((p) => ({ ...p, description: e.target.value }))}
              />
              {seriesList.length > 0 && (
                <TextField
                  select
                  label="Series (optional)"
                  fullWidth
                  value={episodeForm.seriesId}
                  onChange={(e) => setEpisodeForm((p) => ({ ...p, seriesId: e.target.value }))}
                >
                  <MenuItem value="">None</MenuItem>
                  {seriesList.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.title}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEpisodeDialogOpen(false)} disabled={creatingEpisode}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateEpisode}
              disabled={creatingEpisode || !episodeForm.title.trim()}
              startIcon={creatingEpisode ? <CircularProgress size={16} color="inherit" /> : <VideoLibraryIcon />}
            >
              {creatingEpisode ? 'Creating...' : 'Create Episode'}
            </Button>
          </DialogActions>
        </Dialog>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Outline & Generate" />
          <Tab label="Script Sections" />
          <Tab label="Hooks" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>
                Audience
              </Typography>
              <ToggleButtonGroup
                value={audience}
                exclusive
                onChange={(_, v) => v != null && setAudience(v)}
                size="small"
              >
                <ToggleButton value="beginner">Beginner</ToggleButton>
                <ToggleButton value="advanced">Advanced</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              fullWidth
              label="Outline"
              name="outline"
              value={formData.outline || ''}
              onChange={handleChange}
              multiline
              rows={6}
              placeholder="Describe what your script should cover..."
              disabled={generating}
            />

            {generating && (
              <Box>
                <LinearProgress sx={{ mb: 1 }} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Generating with GPT-4
                  {generateCountdown > 0 ? ` — about ${generateCountdown}s remaining` : '...'}
                </Typography>
              </Box>
            )}

            {generateError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={handleGenerate}>
                    Retry
                  </Button>
                }
              >
                {generateError}
              </Alert>
            )}

            {lastTokensUsed && !generating && (
              <Typography variant="caption" color="textSecondary">
                Last generation: {lastTokensUsed.toLocaleString()} tokens used
              </Typography>
            )}

            {rewriteError && (
              <Alert severity="error" onClose={() => setRewriteError(null)}>
                {rewriteError}
              </Alert>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate Script with AI'}
              </Button>
              {script && script.wordCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={rewriting ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                  onClick={handleRewrite}
                  disabled={rewriting || generating}
                >
                  {rewriting ? 'Rewriting...' : `Rewrite for ${audience}`}
                </Button>
              )}
            </Stack>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            {['hook', 'problem', 'solution', 'demo', 'cta', 'outro'].map((section) => (
              <Accordion key={section}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {section}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    value={formData[section as keyof Script] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [section]: e.target.value }))
                    }
                    multiline
                    rows={4}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Save Script'}
            </Button>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Hook Lab
            </Typography>

            <Typography variant="body2" color="textSecondary">
              Generate 5 YouTube and 5 TikTok hooks for this script using AI.
            </Typography>

            {generatingHooks && (
              <Box>
                <LinearProgress sx={{ mb: 1 }} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Generating hooks with GPT-4
                </Typography>
              </Box>
            )}

            {hookError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={handleGenerateHooks}>
                    Retry
                  </Button>
                }
              >
                {hookError}
              </Alert>
            )}

            {!script || script.wordCount === 0 ? (
              <Button
                variant="contained"
                size="large"
                disabled={generatingHooks}
                startIcon={generatingHooks ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerateHooks}
              >
                {generatingHooks ? 'Generating...' : 'Generate Hooks with AI'}
              </Button>
            ) : (
              <Box>
                <Tabs
                  value={hookTabValue}
                  onChange={(_, v) => setHookTabValue(v)}
                  sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="YouTube Hooks" />
                  <Tab label="TikTok Hooks" />
                </Tabs>

                {hookTabValue === 0 && (
                  <Stack spacing={2}>
                    {formData.youtubeHooks && formData.youtubeHooks.length > 0 ? (
                      formData.youtubeHooks.map((hook, idx) => (
                        <TextField
                          key={idx}
                          label={`YouTube Hook ${idx + 1}`}
                          fullWidth
                          multiline
                          rows={2}
                          value={hook}
                          onChange={(e) => {
                            const newHooks = [...(formData.youtubeHooks || [])];
                            newHooks[idx] = e.target.value;
                            setFormData((prev) => ({ ...prev, youtubeHooks: newHooks }));
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No hooks generated yet. Click "Generate Hooks with AI" to create 5 YouTube hooks.
                      </Typography>
                    )}

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveHooks('youtube')}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={20} /> : 'Save YouTube Hooks'}
                    </Button>
                  </Stack>
                )}

                {hookTabValue === 1 && (
                  <Stack spacing={2}>
                    {formData.tiktokHooks && formData.tiktokHooks.length > 0 ? (
                      formData.tiktokHooks.map((hook, idx) => (
                        <TextField
                          key={idx}
                          label={`TikTok Hook ${idx + 1}`}
                          fullWidth
                          multiline
                          rows={2}
                          value={hook}
                          onChange={(e) => {
                            const newHooks = [...(formData.tiktokHooks || [])];
                            newHooks[idx] = e.target.value;
                            setFormData((prev) => ({ ...prev, tiktokHooks: newHooks }));
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No hooks generated yet. Click "Generate Hooks with AI" to create 5 TikTok hooks.
                      </Typography>
                    )}

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveHooks('tiktok')}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={20} /> : 'Save TikTok Hooks'}
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </TabPanel>
      </Box>
    </Container>
  );
}
