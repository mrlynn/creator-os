'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface Idea {
  _id: string;
  title: string;
  description: string;
  status: string;
  platform: string;
  audience: string;
  format: string;
  viralityScore?: number;
  viralityReasoning?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingScript, setCreatingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}`);
        if (!response.ok) throw new Error('Failed to fetch idea');

        const data = await response.json();
        setIdea(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId]);

  const handleScoreVirality = async () => {
    setScoring(true);
    setScoreError(null);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/score`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to score');
      }
      const data = await response.json();
      if (data.idea) setIdea(data.idea);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Failed to score virality');
    } finally {
      setScoring(false);
    }
  };

  const handleCreateScript = async () => {
    setCreatingScript(true);
    setScriptError(null);

    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create script');
      }

      const script = await response.json();
      router.push(`/scripts/${script._id}`);
    } catch (err) {
      setScriptError(err instanceof Error ? err.message : 'An error occurred');
      setCreatingScript(false);
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

  if (error || !idea) {
    return (
      <Container>
        <Box sx={{ py: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography color="error">{error || 'Idea not found'}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {idea.title}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip label={idea.status} color="primary" variant="outlined" />
            <Chip label={idea.platform} variant="outlined" />
            <Chip label={idea.audience} variant="outlined" />
            <Chip label={idea.format} variant="outlined" />
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {idea.description}
              </Typography>

              {idea.notes && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Notes
                  </Typography>
                  <Typography variant="body1">{idea.notes}</Typography>
                </>
              )}

              {scriptError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {scriptError}
                </Alert>
              )}

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    creatingScript ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <AutoFixHighIcon />
                    )
                  }
                  onClick={handleCreateScript}
                  disabled={creatingScript}
                >
                  {creatingScript ? 'Creating Script...' : 'Create Script'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  {scoreError && (
                    <Alert severity="error" sx={{ mb: 1 }} onClose={() => setScoreError(null)}>
                      {scoreError}
                    </Alert>
                  )}
                  <Typography variant="subtitle2" color="textSecondary">
                    Virality Score
                  </Typography>
                  {idea.viralityScore !== undefined ? (
                    <>
                      <Typography variant="h6">{idea.viralityScore}/100</Typography>
                      {idea.viralityReasoning && (
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                          {idea.viralityReasoning}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Not scored yet
                    </Typography>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={handleScoreVirality}
                    disabled={scoring}
                    startIcon={scoring ? <CircularProgress size={14} color="inherit" /> : undefined}
                  >
                    {scoring ? 'Scoring...' : 'Score'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
