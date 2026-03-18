'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSeriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = {
        title: formData.title.trim(),
      };
      if (formData.description.trim()) body.description = formData.description.trim();

      const response = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create series');
      }

      router.push('/app/series');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          New Series
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Create a series to group related episodes.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Description (optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Link href="/app/series" passHref>
                  <Button component="a">Back</Button>
                </Link>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.title.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Creating...' : 'Create Series'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
