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
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RefreshIcon from '@mui/icons-material/Refresh';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

interface Script {
  _id: string;
  title: string;
  ideaId?: string | { _id: string };
  outline?: string;
  hook?: string;
  problem?: string;
  solution?: string;
  demo?: string;
  cta?: string;
  outro?: string;
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
  const [formData, setFormData] = useState<Partial<Script>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastTokensUsed, setLastTokensUsed] = useState<number | null>(null);
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
        body: JSON.stringify({ outline: formData.outline, audience: 'beginner' }),
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

            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Script with AI'}
            </Button>
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
          <Typography variant="body2" color="textSecondary">
            Hook generation coming soon. Save your script first, then generate hooks.
          </Typography>
        </TabPanel>
      </Box>
    </Container>
  );
}
