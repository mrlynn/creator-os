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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Episode {
  _id: string;
  title: string;
  editingStatus: string;
  publishingStatus: string;
  ideaId?: { title: string };
}

const statuses = ['not-started', 'recording', 'editing', 'done'];

export default function PipelinePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

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
        setEpisodes((prev) =>
          prev.map((e) => (e._id === episodeId ? updated : e))
        );
      }
    } catch (error) {
      console.error('Failed to move episode:', error);
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled
          >
            Create Episode
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${statuses.length}, 1fr)`,
            gap: 2,
            overflowX: 'auto',
          }}
        >
          {statuses.map((status) => (
            <Paper key={status} sx={{ p: 2, minHeight: 400, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'capitalize' }}>
                {status}
              </Typography>
              <Stack spacing={1}>
                {episodes
                  .filter((e) => e.editingStatus === status)
                  .map((episode) => (
                    <Paper
                      key={episode._id}
                      sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        {episode.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                        Idea: {episode.ideaId?.title || 'N/A'}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                        {status !== 'done' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              moveEpisode(
                                episode._id,
                                statuses[statuses.indexOf(status) + 1]
                              )
                            }
                          >
                            Next
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
