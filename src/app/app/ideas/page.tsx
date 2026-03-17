'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import AddIcon from '@mui/icons-material/Add';

interface Idea {
  _id: string;
  title: string;
  description: string;
  status: string;
  platform: string;
  audience: string;
  format: string;
  viralityScore?: number;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('');

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (platform) params.append('platform', platform);

      const response = await fetch(`/api/ideas?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ideas');

      const { data } = await response.json();
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [status, platform]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Ideas
          </Typography>
          <Link href="/app/ideas/new" passHref>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component="a"
            >
              New Idea
            </Button>
          </Link>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="raw">Raw</MenuItem>
              <MenuItem value="validated">Validated</MenuItem>
              <MenuItem value="scripted">Scripted</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              label="Platform"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="youtube">YouTube</MenuItem>
              <MenuItem value="tiktok">TikTok</MenuItem>
              <MenuItem value="long-form">Long-form</MenuItem>
              <MenuItem value="multi">Multi-platform</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : ideas.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No ideas found. Create your first idea!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {ideas.map((idea) => (
              <Grid item xs={12} sm={6} md={4} key={idea._id}>
                <IdeaCard
                  id={idea._id}
                  title={idea.title}
                  description={idea.description}
                  status={idea.status}
                  platform={idea.platform}
                  audience={idea.audience}
                  format={idea.format}
                  viralityScore={idea.viralityScore}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
