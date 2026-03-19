'use client';

import { useEffect, useState, useCallback } from 'react';
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
import AssessmentIcon from '@mui/icons-material/Assessment';

interface Episode {
  _id: string;
  title: string;
}

interface TagMetric {
  tagId: string;
  tagName: string;
  totalViews: number;
  totalLikes: number;
  episodeCount: number;
  avgEngagement: number;
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
  const [heatmap, setHeatmap] = useState<TagMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{
    headline: string;
    wins: string[];
    underperformers: string[];
    patterns: string[];
    recommendations: string[];
    momentumScore: number;
  } | null>(null);

  const [snapshotFilters, setSnapshotFilters] = useState({ episodeId: '', platform: '' });

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snapParams = new URLSearchParams();
      if (snapshotFilters.episodeId) snapParams.append('episodeId', snapshotFilters.episodeId);
      if (snapshotFilters.platform) snapParams.append('platform', snapshotFilters.platform);
      const [epRes, snapRes, heatRes] = await Promise.all([
        fetch('/api/episodes?limit=100'),
        fetch(`/api/analytics-snapshots?${snapParams}`),
        fetch('/api/analytics/heatmap'),
      ]);

      if (epRes.ok) {
        const { data } = await epRes.json();
        setEpisodes(data || []);
      }
      if (snapRes.ok) {
        const { data } = await snapRes.json();
        setSnapshots(data || []);
      }
      if (heatRes.ok) {
        const { byTag } = await heatRes.json();
        setHeatmap(byTag || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [snapshotFilters.episodeId, snapshotFilters.platform]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError(null);
    setReportData(null);
    try {
      const res = await fetch('/api/ai/insight-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');
      setReportData(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const getEpisodeTitle = (snap: AnalyticsSnapshot) => {
    const ep = snap.episodeId;
    return typeof ep === 'object' && ep?.title ? ep.title : 'Unknown';
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h3" component="h1">
            Analytics
          </Typography>
          <Button
            variant="outlined"
            startIcon={reportLoading ? <CircularProgress size={18} color="inherit" /> : <AssessmentIcon />}
            onClick={handleGenerateReport}
            disabled={reportLoading}
          >
            Generate Weekly Report
          </Button>
        </Box>

        {reportError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setReportError(null)}>
            {reportError}
          </Alert>
        )}

        {reportData && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
            <Typography variant="h6" gutterBottom>
              {reportData.headline}
            </Typography>
            {reportData.wins.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Wins</Typography>
                {reportData.wins.map((w, i) => (
                  <Typography key={i} variant="body2">
                    • {w}
                  </Typography>
                ))}
              </Box>
            )}
            {reportData.underperformers.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Underperformers</Typography>
                {reportData.underperformers.map((u, i) => (
                  <Typography key={i} variant="body2">
                    • {u}
                  </Typography>
                ))}
              </Box>
            )}
            {reportData.patterns.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Patterns</Typography>
                {reportData.patterns.map((p, i) => (
                  <Typography key={i} variant="body2">
                    • {p}
                  </Typography>
                ))}
              </Box>
            )}
            {reportData.recommendations.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Recommendations</Typography>
                {reportData.recommendations.map((r, i) => (
                  <Typography key={i} variant="body2">
                    • {r}
                  </Typography>
                ))}
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              Momentum Score: {reportData.momentumScore}/10
            </Typography>
          </Paper>
        )}

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

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Topic Performance
        </Typography>
        {heatmap.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
            <Typography color="textSecondary">
              Add tags to episodes for topic insights.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tag</TableCell>
                  <TableCell align="right">Total Views</TableCell>
                  <TableCell align="right">Total Likes</TableCell>
                  <TableCell align="right">Episodes</TableCell>
                  <TableCell align="right">Avg Engagement</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {heatmap.map((row) => (
                  <TableRow key={row.tagId}>
                    <TableCell>{row.tagName}</TableCell>
                    <TableCell align="right">
                      {row.totalViews.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {row.totalLikes.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">{row.episodeCount}</TableCell>
                    <TableCell align="right">
                      {(row.avgEngagement * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography variant="h6" gutterBottom>
          Snapshots
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <TextField
            select
            size="small"
            label="Filter by Episode"
            sx={{ minWidth: 200 }}
            value={snapshotFilters.episodeId}
            onChange={(e) => setSnapshotFilters((p) => ({ ...p, episodeId: e.target.value }))}
          >
            <MenuItem value="">All episodes</MenuItem>
            {episodes.map((ep) => (
              <MenuItem key={ep._id} value={ep._id}>
                {ep.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Filter by Platform"
            sx={{ minWidth: 150 }}
            value={snapshotFilters.platform}
            onChange={(e) => setSnapshotFilters((p) => ({ ...p, platform: e.target.value }))}
          >
            <MenuItem value="">All platforms</MenuItem>
            {PLATFORMS.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
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
