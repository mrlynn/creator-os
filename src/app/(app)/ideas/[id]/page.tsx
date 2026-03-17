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
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Idea {
  _id: string;
  title: string;
  description: string;
  status: string;
  platform: string;
  audience: string;
  format: string;
  viralityScore?: number;
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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
          >
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
                  <Typography variant="body1">
                    {idea.notes}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </Typography>

                {idea.viralityScore !== undefined && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                      Virality Score
                    </Typography>
                    <Typography variant="h6">
                      {idea.viralityScore}/100
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
