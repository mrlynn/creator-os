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
} from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';

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
        <Link href="/app/library" passHref>
          <Button sx={{ mt: 2 }} component="a" startIcon={<ArrowBackIcon />}>
            Back to Library
          </Button>
        </Link>
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

        <Link href="/app/library" passHref>
          <Button startIcon={<ArrowBackIcon />} component="a" sx={{ mb: 2 }}>
            Back to Library
          </Button>
        </Link>

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
              <Link href={`/app/series/${series._id}`} passHref>
                <Button component="a" size="small">
                  {series.title}
                </Button>
              </Link>
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
              <Link href={`/app/scripts/${scriptId}`} passHref>
                <Button startIcon={<ArticleIcon />} component="a" size="small">
                  View Script
                </Button>
              </Link>
            </Box>
          )}

          <Link href="/app/analytics" passHref>
            <Button startIcon={<BarChartIcon />} component="a" size="small">
              Analytics
            </Button>
          </Link>
        </Stack>

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
