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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PublishIcon from '@mui/icons-material/Publish';

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

  // Publishing record dialog
  const [pubDialogOpen, setPubDialogOpen] = useState(false);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [pubForm, setPubForm] = useState({ ...EMPTY_PUB_FORM });
  const [creatingPub, setCreatingPub] = useState(false);
  const [pubError, setPubError] = useState<string | null>(null);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await fetch('/api/episodes');
      if (!response.ok) throw new Error('Failed to fetch episodes');
      const { data } = await response.json();
      setEpisodes(data);
    } finally {
      setLoading(false);
    }
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Publishing Pipeline
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

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

        {episodes.length === 0 ? (
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
