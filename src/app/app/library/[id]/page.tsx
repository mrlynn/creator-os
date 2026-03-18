'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface Tag {
  _id: string;
  name: string;
}

interface PublishingRecord {
  _id: string;
  platform: string;
  status: string;
  publishedUrl?: string;
  scheduledDate?: string;
}

interface ClipConcept {
  clipNumber: number;
  conceptTitle: string;
  originalSection: string;
  estimatedDuration: string;
  newHook: string;
  script: string;
  onScreenTextSuggestions?: string[];
  whyItStandsAlone: string;
  timestampRange?: { start: string; end: string };
}

interface Episode {
  _id: string;
  title: string;
  description?: string;
  publishingStatus?: string;
  editingStatus?: string;
  seriesId?: { _id: string; title: string } | null;
  tags?: Tag[];
  scriptId?: { _id: string } | string | null;
  publishingRecords?: PublishingRecord[];
  aiMetadata?: { evergreenScore?: number; evergreenReasoning?: string };
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
  'not-started': 'Not Started',
  recording: 'Recording',
  editing: 'Editing',
  done: 'Done',
};

export default function EpisodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repurposeOpen, setRepurposeOpen] = useState(false);
  const [repurposeLoading, setRepurposeLoading] = useState(false);
  const [repurposeError, setRepurposeError] = useState<string | null>(null);
  const [clips, setClips] = useState<ClipConcept[]>([]);
  const [repurposePlatform, setRepurposePlatform] = useState('tiktok');
  const [copySnackbar, setCopySnackbar] = useState(false);
  const [copySnackbarMessage, setCopySnackbarMessage] = useState('Copied to clipboard');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<{
    titles: string[];
    recommendedTitle: string;
    description: string;
    tags: string[];
  } | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [evergreenLoading, setEvergreenLoading] = useState(false);
  const [evergreenError, setEvergreenError] = useState<string | null>(null);
  const [evergreenScore, setEvergreenScore] = useState<number | null>(null);
  const [evergreenReasoning, setEvergreenReasoning] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<{ _id: string; title: string }[]>([]);
  const [seriesId, setSeriesId] = useState<string>('');
  const [seriesSaving, setSeriesSaving] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [createFromClipLoading, setCreateFromClipLoading] = useState<number | null>(null);

  const handleCreateEpisodeFromClip = async (clip: ClipConcept) => {
    setCreateFromClipLoading(clip.clipNumber);
    try {
      const res = await fetch('/api/episodes/from-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEpisodeId: id,
          clip: {
            conceptTitle: clip.conceptTitle,
            newHook: clip.newHook,
            script: clip.script,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create episode');
      const newId = data.episode?._id;
      if (newId) {
        router.push(`/app/library/${newId}`);
      } else {
        router.push('/app/pipeline');
      }
    } catch (err) {
      setRepurposeError(err instanceof Error ? err.message : 'Failed to create episode');
    } finally {
      setCreateFromClipLoading(null);
    }
  };

  const handleRepurpose = async () => {
    setRepurposeLoading(true);
    setRepurposeError(null);
    setClips([]);
    try {
      const res = await fetch(`/api/episodes/${id}/repurpose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: repurposePlatform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to repurpose');
      setClips(data.clips || []);
    } catch (err) {
      setRepurposeError(err instanceof Error ? err.message : 'Failed to repurpose');
    } finally {
      setRepurposeLoading(false);
    }
  };

  const copyClipContent = (clip: ClipConcept) => {
    const ts = clip.timestampRange
      ? `\nTimestamp: ${clip.timestampRange.start} – ${clip.timestampRange.end}\n`
      : '';
    const text = `# ${clip.conceptTitle}${ts}\nHook: ${clip.newHook}\n\n${clip.script}`;
    navigator.clipboard.writeText(text);
    setCopySnackbarMessage('Copied to clipboard');
    setCopySnackbar(true);
  };

  const copyAllClips = () => {
    const lines = clips.map((clip) => {
      const ts = clip.timestampRange
        ? `\nTimestamp: ${clip.timestampRange.start} – ${clip.timestampRange.end}\n`
        : '';
      return `# ${clip.clipNumber}. ${clip.conceptTitle}${ts}\nHook: ${clip.newHook}\n\n${clip.script}`;
    });
    const text = lines.join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopySnackbarMessage(`Copied ${clips.length} clips to clipboard`);
    setCopySnackbar(true);
  };

  const handleGenerateSeo = async () => {
    setSeoLoading(true);
    setSeoError(null);
    setSeoData(null);
    try {
      const res = await fetch(`/api/episodes/${id}/seo`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate SEO');
      setSeoData(data);
    } catch (err) {
      setSeoError(err instanceof Error ? err.message : 'Failed to generate SEO');
    } finally {
      setSeoLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySnackbar(true);
  };

  const handleScoreEvergreen = async () => {
    setEvergreenLoading(true);
    setEvergreenError(null);
    setEvergreenScore(null);
    setEvergreenReasoning(null);
    try {
      const res = await fetch(`/api/episodes/${id}/evergreen`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score evergreen');
      setEvergreenScore(data.evergreenScore);
      setEvergreenReasoning(data.reasoning);
    } catch (err) {
      setEvergreenError(err instanceof Error ? err.message : 'Failed to score evergreen');
    } finally {
      setEvergreenLoading(false);
    }
  };

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch episode');
        const data = await response.json();
        setEpisode(data);
        const sid = data.seriesId && typeof data.seriesId === 'object' ? data.seriesId._id : data.seriesId || '';
        setSeriesId(sid);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchEpisode();
  }, [id]);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch('/api/series?status=all');
        if (res.ok) {
          const { data } = await res.json();
          setSeriesList(data || []);
        }
      } catch {
        // Optional
      }
    };
    fetchSeries();
  }, []);

  const handleSeriesChange = async (newSeriesId: string) => {
    setSeriesId(newSeriesId);
    setSeriesError(null);
    setSeriesSaving(true);
    try {
      const res = await fetch(`/api/episodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId: newSeriesId || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update series');
      }
      const updated = await res.json();
      setEpisode(updated);
      setSuccessSnackbar(true);
    } catch (err) {
      setSeriesError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSeriesSaving(false);
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

  if (!episode) {
    return (
      <Container>
        <Alert severity="error">Episode not found</Alert>
        <Button sx={{ mt: 2 }} component={Link} href="/app/library" startIcon={<ArrowBackIcon />}>
          Back to Library
        </Button>
      </Container>
    );
  }

  const scriptId =
    episode.scriptId && typeof episode.scriptId === 'object'
      ? episode.scriptId._id
      : episode.scriptId;
  const series = episode.seriesId && typeof episode.seriesId === 'object' ? episode.seriesId : null;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Button startIcon={<ArrowBackIcon />} component={Link} href="/app/library" sx={{ mb: 2 }}>
          Back to Library
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {episode.title}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: 2 }} flexWrap="wrap">
          {episode.publishingStatus && (
            <Chip
              label={STATUS_LABELS[episode.publishingStatus] || episode.publishingStatus}
              size="small"
            />
          )}
          {episode.editingStatus && (
            <Chip
              label={STATUS_LABELS[episode.editingStatus] || episode.editingStatus}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        {episode.description && (
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            {episode.description}
          </Typography>
        )}

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Series
            </Typography>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Series</InputLabel>
              <Select
                value={seriesId}
                onChange={(e) => handleSeriesChange(e.target.value)}
                label="Series"
                disabled={seriesSaving}
              >
                <MenuItem value="">None</MenuItem>
                {seriesList.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {series && (
              <Button
                component={Link}
                href={`/app/series/${series._id}`}
                size="small"
                sx={{ ml: 1, verticalAlign: 'middle' }}
              >
                View Series
              </Button>
            )}
            {seriesError && (
              <Alert severity="error" sx={{ mt: 1 }} onClose={() => setSeriesError(null)}>
                {seriesError}
              </Alert>
            )}
          </Box>

          {episode.tags && episode.tags.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Tags
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {episode.tags.map((t) => (
                  <Chip key={t._id} label={t.name} size="small" />
                ))}
              </Stack>
            </Box>
          )}

          {scriptId && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Script
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button startIcon={<ArticleIcon />} component={Link} href={`/app/scripts/${scriptId}`} size="small">
                  View Script
                </Button>
                <Button
                  startIcon={<AutoAwesomeIcon />}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setRepurposeOpen(true);
                    setRepurposeError(null);
                    setClips([]);
                  }}
                >
                  Repurpose
                </Button>
              </Stack>
            </Box>
          )}

          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                startIcon={<SearchIcon />}
                size="small"
                variant="outlined"
                onClick={() => {
                  setSeoOpen(true);
                  setSeoError(null);
                  setSeoData(null);
                }}
              >
                Generate SEO
              </Button>
              <Button
                startIcon={<TrendingUpIcon />}
                size="small"
                variant="outlined"
                onClick={handleScoreEvergreen}
                disabled={evergreenLoading}
              >
                {evergreenLoading ? 'Scoring...' : 'Score Evergreen'}
              </Button>
            </Stack>
            {evergreenError && (
              <Alert severity="error" sx={{ mt: 1 }} onClose={() => setEvergreenError(null)}>
                {evergreenError}
              </Alert>
            )}
            {((evergreenScore != null && evergreenReasoning) ||
              (episode.aiMetadata?.evergreenScore != null && episode.aiMetadata?.evergreenReasoning)) && (
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Evergreen Score: {(evergreenScore ?? episode.aiMetadata?.evergreenScore) ?? 0}/100
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {evergreenReasoning ?? episode.aiMetadata?.evergreenReasoning ?? ''}
                </Typography>
              </Box>
            )}
          </Box>

          <Button startIcon={<BarChartIcon />} component={Link} href="/app/analytics" size="small">
            Analytics
          </Button>
        </Stack>

        <Dialog open={seoOpen} onClose={() => setSeoOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Generate SEO</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                startIcon={seoLoading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                onClick={handleGenerateSeo}
                disabled={seoLoading}
              >
                {seoLoading ? 'Generating...' : 'Generate SEO'}
              </Button>
              {seoError && (
                <Alert severity="error" onClose={() => setSeoError(null)}>
                  {seoError}
                </Alert>
              )}
              {seoData && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommended Title
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {seoData.recommendedTitle}
                      <IconButton size="small" onClick={() => copyToClipboard(seoData.recommendedTitle)} aria-label="Copy">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      All Title Options
                    </Typography>
                    <Stack spacing={0.5}>
                      {seoData.titles.map((t, i) => (
                        <Typography key={i} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {t}
                          <IconButton size="small" onClick={() => copyToClipboard(t)} aria-label="Copy">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {seoData.description}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(seoData.description)} aria-label="Copy">
                      <ContentCopyIcon fontSize="small" /> Copy
                    </IconButton>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Typography variant="body2">{seoData.tags.join(', ')}</Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(seoData.tags.join(', '))} aria-label="Copy">
                      <ContentCopyIcon fontSize="small" /> Copy
                    </IconButton>
                  </Box>
                </Stack>
              )}
            </Stack>
          </DialogContent>
        </Dialog>

        <Dialog open={repurposeOpen} onClose={() => setRepurposeOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Repurpose for Short-Form</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Platform"
                value={repurposePlatform}
                onChange={(e) => setRepurposePlatform(e.target.value)}
                size="small"
                sx={{ maxWidth: 200 }}
              >
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="instagram">Instagram Reels</MenuItem>
              </TextField>
              <Button
                variant="contained"
                startIcon={repurposeLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleRepurpose}
                disabled={repurposeLoading}
              >
                {repurposeLoading ? 'Generating...' : 'Generate Clips'}
              </Button>
              {repurposeError && (
                <Alert severity="error" onClose={() => setRepurposeError(null)}>
                  {repurposeError}
                </Alert>
              )}
              {clips.length > 0 && (
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Typography variant="subtitle2">Clip Concepts</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={copyAllClips}
                    >
                      Copy All Clips
                    </Button>
                  </Stack>
                  {clips.map((clip) => (
                    <Accordion key={clip.clipNumber}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">
                          {clip.clipNumber}. {clip.conceptTitle}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyClipContent(clip);
                          }}
                          sx={{ ml: 1 }}
                          aria-label="Copy"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {clip.timestampRange && (
                            <Typography variant="caption" color="textSecondary">
                              Timestamp: {clip.timestampRange.start} – {clip.timestampRange.end}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>Hook:</strong> {clip.newHook}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {clip.script}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {clip.estimatedDuration} • {clip.whyItStandsAlone}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              createFromClipLoading === clip.clipNumber ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <AddCircleOutlineIcon />
                              )
                            }
                            onClick={() => handleCreateEpisodeFromClip(clip)}
                            disabled={createFromClipLoading !== null}
                          >
                            Create Episode
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              )}
            </Stack>
          </DialogContent>
        </Dialog>

        <Snackbar
          open={copySnackbar}
          autoHideDuration={2000}
          onClose={() => setCopySnackbar(false)}
          message={copySnackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
        <Snackbar
          open={successSnackbar}
          autoHideDuration={2000}
          onClose={() => setSuccessSnackbar(false)}
          message="Series updated"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        {episode.publishingRecords && episode.publishingRecords.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Publishing Records
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Platform</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Scheduled</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {episode.publishingRecords.map((rec) => (
                    <TableRow key={rec._id}>
                      <TableCell>{rec.platform}</TableCell>
                      <TableCell>{rec.status}</TableCell>
                      <TableCell>
                        {rec.publishedUrl ? (
                          <a
                            href={rec.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.875rem' }}
                          >
                            Link
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {rec.scheduledDate
                          ? new Date(rec.scheduledDate).toLocaleDateString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
