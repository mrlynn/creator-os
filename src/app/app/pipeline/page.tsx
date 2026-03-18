'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PublishIcon from '@mui/icons-material/Publish';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { SearchField } from '@/components/shared-ui/SearchField';

const CalendarView = dynamic(
  () => import('@/components/pipeline/CalendarView'),
  { ssr: false }
);

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
  editingStatus: string;
  publishingStatus: string;
  ideaId?: { title: string };
  publishingRecords?: PublishingRecord[];
}

const EDITING_STATUSES = ['not-started', 'recording', 'editing', 'done'];

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Not Started',
  recording: 'Recording',
  editing: 'Editing',
  done: 'Done',
};

const PLATFORM_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  youtube: 'error',
  tiktok: 'default',
  instagram: 'secondary',
  custom: 'info',
};

const EMPTY_PUB_FORM = {
  platform: 'youtube' as string,
  status: 'scheduled' as string,
  publishedUrl: '',
  scheduledDate: '',
};

export default function PipelinePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState(0);
  const [editingFilter, setEditingFilter] = useState('');
  const [search, setSearch] = useState('');

  // Publishing record dialog
  const [pubDialogOpen, setPubDialogOpen] = useState(false);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [pubForm, setPubForm] = useState({ ...EMPTY_PUB_FORM });
  const [creatingPub, setCreatingPub] = useState(false);
  const [pubError, setPubError] = useState<string | null>(null);

  // Plan This Week
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<{
    youtube: Array<{ day: string; ideaId?: string; title: string; rationale?: string }>;
    tiktok: Array<{ day: string; ideaId?: string; title: string; derivedFrom?: string }>;
    warnings: string[];
    suggestedNewIdeas: string[];
  } | null>(null);
  const [cadenceCheckLoading, setCadenceCheckLoading] = useState(false);
  const [cadenceWarnings, setCadenceWarnings] = useState<string[]>([]);

  const fetchEpisodes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (editingFilter) params.append('editingStatus', editingFilter);
      if (search.trim()) params.append('q', search.trim());
      const response = await fetch(`/api/episodes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch episodes');
      const { data } = await response.json();
      setEpisodes(data);
    } finally {
      setLoading(false);
    }
  }, [editingFilter, search]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const moveEpisode = async (episodeId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/episodes/${episodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editingStatus: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setEpisodes((prev) => prev.map((e) => (e._id === episodeId ? { ...e, ...updated } : e)));
      }
    } catch (error) {
      console.error('Failed to move episode:', error);
    }
  };

  const handlePlanThisWeek = async () => {
    setPlanLoading(true);
    setPlanError(null);
    setPlanData(null);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setPlanData(data);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleCheckCadence = async () => {
    setCadenceCheckLoading(true);
    setCadenceWarnings([]);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check cadence');
      setCadenceWarnings(data.warnings || []);
    } catch (err) {
      setCadenceWarnings([err instanceof Error ? err.message : 'Failed to check cadence']);
    } finally {
      setCadenceCheckLoading(false);
    }
  };

  const handleOpenPubDialog = (episodeId: string) => {
    setActiveEpisodeId(episodeId);
    setPubForm({ ...EMPTY_PUB_FORM });
    setPubError(null);
    setPubDialogOpen(true);
  };

  const handleCreatePublishingRecord = async () => {
    if (!activeEpisodeId) return;

    setCreatingPub(true);
    setPubError(null);

    try {
      const payload: Record<string, string> = {
        episodeId: activeEpisodeId,
        platform: pubForm.platform,
        status: pubForm.status,
      };
      if (pubForm.publishedUrl.trim()) payload.publishedUrl = pubForm.publishedUrl.trim();
      if (pubForm.scheduledDate) payload.scheduledDate = new Date(pubForm.scheduledDate).toISOString();

      const response = await fetch('/api/publishing-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create publishing record');
      }

      const newRecord = await response.json();

      // Optimistically update episode card
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep._id === activeEpisodeId
            ? { ...ep, publishingRecords: [...(ep.publishingRecords || []), newRecord] }
            : ep
        )
      );

      setPubDialogOpen(false);
      setSuccessMessage(`Publishing record added for ${pubForm.platform}`);
    } catch (err) {
      setPubError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreatingPub(false);
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h3" component="h1">
            Publishing Pipeline
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <SearchField value={search} onChange={setSearch} placeholder="Search episodes..." size="small" />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Editing Status</InputLabel>
              <Select
                value={editingFilter}
                onChange={(e) => setEditingFilter(e.target.value)}
                label="Editing Status"
              >
                <MenuItem value="">All</MenuItem>
                {EDITING_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_LABELS[s] || s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={planLoading ? <CircularProgress size={18} color="inherit" /> : <CalendarMonthIcon />}
              onClick={() => {
                setPlanDialogOpen(true);
                setPlanError(null);
                setPlanData(null);
                handlePlanThisWeek();
              }}
              disabled={planLoading}
            >
              Plan This Week
            </Button>
            <Typography variant="caption" color="textSecondary">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Box>

        <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>AI Weekly Plan</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {planLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {planError && (
                <Alert severity="error" onClose={() => setPlanError(null)}>
                  {planError}
                </Alert>
              )}
              {planData && !planLoading && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      YouTube (3/week)
                    </Typography>
                    {planData.youtube.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No recommendations
                      </Typography>
                    ) : (
                      planData.youtube.map((item, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                          {item.day}: {item.title}
                          {item.rationale && (
                            <Typography component="span" variant="caption" color="textSecondary" display="block">
                              {item.rationale}
                            </Typography>
                          )}
                        </Typography>
                      ))
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      TikTok (5/week)
                    </Typography>
                    {planData.tiktok.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No recommendations
                      </Typography>
                    ) : (
                      planData.tiktok.map((item, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                          {item.day}: {item.title}
                          {item.derivedFrom && (
                            <Typography component="span" variant="caption" color="textSecondary" display="block">
                              From: {item.derivedFrom}
                            </Typography>
                          )}
                        </Typography>
                      ))
                    )}
                  </Box>
                  {planData.warnings.length > 0 && (
                    <Alert severity="warning">
                      {planData.warnings.map((w, i) => (
                        <Typography key={i} variant="body2">
                          {w}
                        </Typography>
                      ))}
                    </Alert>
                  )}
                  {planData.suggestedNewIdeas.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Suggested New Ideas
                      </Typography>
                      {planData.suggestedNewIdeas.map((idea, i) => (
                        <Typography key={i} variant="body2" color="textSecondary">
                          • {idea}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPlanDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Kanban" />
          <Tab label="Calendar" />
        </Tabs>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={successMessage}
        />

        {/* Publishing Record Dialog */}
        <Dialog open={pubDialogOpen} onClose={() => setPubDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Publishing Record</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {pubError && <Alert severity="error">{pubError}</Alert>}
              <TextField
                select
                label="Platform"
                fullWidth
                value={pubForm.platform}
                onChange={(e) => setPubForm((p) => ({ ...p, platform: e.target.value }))}
              >
                <MenuItem value="youtube">YouTube</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                fullWidth
                value={pubForm.status}
                onChange={(e) => setPubForm((p) => ({ ...p, status: e.target.value }))}
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </TextField>
              <TextField
                label="URL (optional)"
                fullWidth
                placeholder="https://youtube.com/watch?v=..."
                value={pubForm.publishedUrl}
                onChange={(e) => setPubForm((p) => ({ ...p, publishedUrl: e.target.value }))}
              />
              <TextField
                label="Scheduled Date (optional)"
                type="datetime-local"
                fullWidth
                value={pubForm.scheduledDate}
                onChange={(e) => setPubForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPubDialogOpen(false)} disabled={creatingPub}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreatePublishingRecord}
              disabled={creatingPub}
              startIcon={creatingPub ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            >
              {creatingPub ? 'Adding...' : 'Add Record'}
            </Button>
          </DialogActions>
        </Dialog>

        {viewTab === 1 ? (
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={cadenceCheckLoading ? <CircularProgress size={18} color="inherit" /> : <CalendarMonthIcon />}
                  onClick={handleCheckCadence}
                  disabled={cadenceCheckLoading}
                >
                  Check cadence
                </Button>
              </Stack>
              {cadenceWarnings.length > 0 && (
                <Alert severity="warning" onClose={() => setCadenceWarnings([])}>
                  {cadenceWarnings.map((w, i) => (
                    <Typography key={i} variant="body2" component="div">
                      {w}
                    </Typography>
                  ))}
                </Alert>
              )}
              <CalendarView />
            </Stack>
          </Paper>
        ) : episodes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>
              No episodes yet.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create a script from an idea, then use "Create Episode" to add it here.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${EDITING_STATUSES.length}, 1fr)`,
              gap: 2,
              overflowX: 'auto',
            }}
          >
            {EDITING_STATUSES.map((status) => {
              const columnEpisodes = episodes.filter((e) => e.editingStatus === status);
              return (
                <Paper key={status} sx={{ p: 2, minHeight: 400, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {STATUS_LABELS[status]}
                    </Typography>
                    <Chip label={columnEpisodes.length} size="small" />
                  </Box>

                  <Stack spacing={1.5}>
                    {columnEpisodes.map((episode) => (
                      <Paper
                        key={episode._id}
                        sx={{
                          p: 1.5,
                          bgcolor: 'white',
                          '&:hover': { boxShadow: 2 },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {episode.title}
                        </Typography>
                        {episode.ideaId?.title && (
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                            {episode.ideaId.title}
                          </Typography>
                        )}

                        {/* Publishing records on this episode */}
                        {episode.publishingRecords && episode.publishingRecords.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                            {episode.publishingRecords.map((rec) => (
                              <Chip
                                key={rec._id}
                                label={rec.platform}
                                size="small"
                                color={PLATFORM_COLORS[rec.platform] || 'default'}
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        )}

                        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                          {status !== 'done' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                moveEpisode(
                                  episode._id,
                                  EDITING_STATUSES[EDITING_STATUSES.indexOf(status) + 1]
                                )
                              }
                            >
                              Next
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<PublishIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenPubDialog(episode._id)}
                          >
                            Publish
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
}
