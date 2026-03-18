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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTagPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'topic' as string,
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
        name: formData.name.trim(),
        category: formData.category,
      };
      if (formData.slug.trim()) body.slug = formData.slug.trim();
      if (formData.description.trim()) body.description = formData.description.trim();

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create tag');
      }

      router.push('/app/tags');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          New Tag
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Create a tag to organize your content ideas.
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
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Slug (optional)"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Auto-generated from name if empty"
              />
              <TextField
                fullWidth
                label="Description (optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  label="Category"
                >
                  <MenuItem value="topic">Topic</MenuItem>
                  <MenuItem value="platform">Platform</MenuItem>
                  <MenuItem value="audience">Audience</MenuItem>
                  <MenuItem value="format">Format</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button component={Link} href="/app/tags">Back</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.name.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Creating...' : 'Create Tag'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
