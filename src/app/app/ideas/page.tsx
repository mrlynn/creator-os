'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Stack,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { SearchField } from '@/components/shared-ui/SearchField';
import { ListSkeleton } from '@/components/shared-ui/ListSkeleton';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useToast } from '@/components/shared-ui/Toast';

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
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (platform) params.append('platform', platform);
      if (search.trim()) params.append('q', search.trim());

      const response = await fetch(`/api/ideas?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ideas');

      const { data } = await response.json();
      setIdeas(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [status, platform, search, toast]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Ideas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/app/ideas/new"
          >
            New Idea
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <SearchField value={search} onChange={setSearch} placeholder="Search ideas..." />
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
              <MenuItem value="archived">Archived</MenuItem>
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
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={fetchIdeas}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <ListSkeleton count={6} variant="card" />
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
                  onDelete={async (id) => {
                    if (!confirm('Archive this idea?')) return;
                    try {
                      const res = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Failed to archive');
                      toast('Idea archived', 'success');
                      fetchIdeas();
                    } catch {
                      toast('Failed to archive idea', 'error');
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
