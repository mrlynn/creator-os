'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArchiveIcon from '@mui/icons-material/Archive';

interface Series {
  _id: string;
  title: string;
  description?: string;
  status: string;
  episodeCount: number;
}

interface Episode {
  _id: string;
  title: string;
  publishingStatus?: string;
  editingStatus?: string;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Series>>({});
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seriesRes, episodesRes] = await Promise.all([
        fetch(`/api/series/${id}`),
        fetch(`/api/episodes?seriesId=${id}`),
      ]);

      if (!seriesRes.ok) throw new Error('Failed to fetch series');
      const seriesData = await seriesRes.json();
      setSeries(seriesData);
      setFormData(seriesData);

      if (episodesRes.ok) {
        const { data } = await episodesRes.json();
        setEpisodes(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/series/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update');
      }
      const updated = await response.json();
      setSeries(updated);
      setFormData(updated);
      setEditing(false);
      setSuccessMessage('Series updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this series? It will be moved to archived status.')) return;
    setArchiving(true);
    setError(null);
    try {
      const response = await fetch(`/api/series/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to archive');
      }
      setSuccessMessage('Series archived');
      router.push('/app/series');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive');
    } finally {
      setArchiving(false);
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!series) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Series not found</Alert>
        <Button sx={{ mt: 2 }} component={Link} href="/app/series" startIcon={<ArrowBackIcon />}>
          Back to Series
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/app/series" sx={{ mb: 2 }}>
          Back to Series
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={successMessage}
        />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {series.title}
            </Typography>
            <Stack direction="row" spacing={1}>
              {!editing ? (
                <Button variant="outlined" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={() => setEditing(false)}>Cancel</Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
              <Button
                color="error"
                variant="outlined"
                startIcon={<ArchiveIcon />}
                onClick={handleArchive}
                disabled={archiving}
              >
                Archive
              </Button>
            </Stack>
          </Box>

          {editing ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          ) : (
            <>
              {series.description && (
                <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                  {series.description}
                </Typography>
              )}
              <Chip label={STATUS_LABELS[series.status] || series.status} size="small" sx={{ mr: 1 }} />
              <Chip label={`${series.episodeCount ?? 0} episodes`} size="small" />
            </>
          )}
        </Paper>

        <Typography variant="h6" gutterBottom>
          Episodes
        </Typography>
        {episodes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No episodes in this series yet. Create episodes from scripts and assign them to this series.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {episodes.map((ep) => (
              <Paper key={ep._id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1">{ep.title}</Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {ep.editingStatus && (
                      <Chip label={ep.editingStatus} size="small" variant="outlined" />
                    )}
                    {ep.publishingStatus && (
                      <Chip label={ep.publishingStatus} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>
                <Button size="small" component={Link} href={`/app/library/${ep._id}`}>
                  View
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
