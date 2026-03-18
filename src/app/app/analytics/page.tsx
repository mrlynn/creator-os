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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Episode {
  _id: string;
  title: string;
}

interface AnalyticsSnapshot {
  _id: string;
  episodeId: string | { _id: string; title: string };
  platform: string;
  snapshotDate: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  watchTimeMinutes?: number;
  engagement?: number;
}

const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'overall'];

export default function AnalyticsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    episodeId: '',
    platform: 'youtube',
    snapshotDate: new Date().toISOString().slice(0, 16),
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    watchTimeMinutes: '',
    engagement: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epRes, snapRes] = await Promise.all([
        fetch('/api/episodes?limit=100'),
        fetch('/api/analytics-snapshots'),
      ]);

      if (epRes.ok) {
        const { data } = await epRes.json();
        setEpisodes(data || []);
      }
      if (snapRes.ok) {
        const { data } = await snapRes.json();
        setSnapshots(data || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.episodeId) {
      setError('Please select an episode');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        episodeId: form.episodeId,
        platform: form.platform,
        snapshotDate: new Date(form.snapshotDate).toISOString(),
        viewCount: form.viewCount,
        likeCount: form.likeCount,
        commentCount: form.commentCount,
        shareCount: form.shareCount,
      } as Record<string, unknown>;
      if (form.watchTimeMinutes !== '') {
        payload.watchTimeMinutes = parseFloat(form.watchTimeMinutes);
      }
      if (form.engagement !== '') {
        payload.engagement = parseFloat(form.engagement);
      }

      const response = await fetch('/api/analytics-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add snapshot');
      }

      const newSnapshot = await response.json();
      setSnapshots((prev) => [newSnapshot, ...prev]);
      setSuccessMessage('Analytics snapshot added');
      setForm((prev) => ({
        ...prev,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        watchTimeMinutes: '',
        engagement: '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add snapshot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/analytics-snapshots/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSnapshots((prev) => prev.filter((s) => s._id !== id));
        setSuccessMessage('Snapshot deleted');
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const getEpisodeTitle = (snap: AnalyticsSnapshot) => {
    const ep = snap.episodeId;
    return typeof ep === 'object' && ep?.title ? ep.title : 'Unknown';
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Analytics
        </Typography>

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
          <Typography variant="h6" gutterBottom>
            Add Snapshot
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                select
                label="Episode"
                required
                fullWidth
                value={form.episodeId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, episodeId: e.target.value }))
                }
              >
                <MenuItem value="">Select episode</MenuItem>
                {episodes.map((ep) => (
                  <MenuItem key={ep._id} value={ep._id}>
                    {ep.title}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Platform"
                  fullWidth
                  value={form.platform}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, platform: e.target.value }))
                  }
                >
                  {PLATFORMS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Snapshot Date"
                  type="datetime-local"
                  fullWidth
                  value={form.snapshotDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, snapshotDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Views"
                  type="number"
                  fullWidth
                  value={form.viewCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      viewCount: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Likes"
                  type="number"
                  fullWidth
                  value={form.likeCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      likeCount: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Comments"
                  type="number"
                  fullWidth
                  value={form.commentCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      commentCount: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Shares"
                  type="number"
                  fullWidth
                  value={form.shareCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      shareCount: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  inputProps={{ min: 0 }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Watch time (min)"
                  type="number"
                  fullWidth
                  value={form.watchTimeMinutes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, watchTimeMinutes: e.target.value }))
                  }
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <TextField
                  label="Engagement"
                  type="number"
                  fullWidth
                  value={form.engagement}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, engagement: e.target.value }))
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                disabled={submitting || !form.episodeId}
              >
                {submitting ? 'Adding...' : 'Add Snapshot'}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Snapshots
        </Typography>
        {snapshots.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No analytics snapshots yet. Add one above.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Episode</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Likes</TableCell>
                  <TableCell align="right">Comments</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell padding="none" />
                </TableRow>
              </TableHead>
              <TableBody>
                {snapshots.map((snap) => (
                  <TableRow key={snap._id}>
                    <TableCell>{getEpisodeTitle(snap)}</TableCell>
                    <TableCell>{snap.platform}</TableCell>
                    <TableCell>
                      {new Date(snap.snapshotDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {snap.viewCount.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {snap.likeCount.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {snap.commentCount.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {snap.shareCount.toLocaleString()}
                    </TableCell>
                    <TableCell padding="none">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(snap._id)}
                        color="error"
                        aria-label="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
}
