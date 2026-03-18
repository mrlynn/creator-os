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
} from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
    const text = `# ${clip.conceptTitle}\n\nHook: ${clip.newHook}\n\n${clip.script}`;
    navigator.clipboard.writeText(text);
    setCopySnackbar(true);
  };

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch episode');
        const data = await response.json();
        setEpisode(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchEpisode();
  }, [id]);

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
          {series && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Series
              </Typography>
              <Button component={Link} href={`/app/series/${series._id}`} size="small">
                {series.title}
              </Button>
            </Box>
          )}

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

          <Button startIcon={<BarChartIcon />} component={Link} href="/app/analytics" size="small">
            Analytics
          </Button>
        </Stack>

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
                  <Typography variant="subtitle2">Clip Concepts</Typography>
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
                          <Typography variant="body2">
                            <strong>Hook:</strong> {clip.newHook}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {clip.script}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {clip.estimatedDuration} • {clip.whyItStandsAlone}
                          </Typography>
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
          message="Copied to clipboard"
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
