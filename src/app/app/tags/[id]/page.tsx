'use client';

import { useEffect, useState } from 'react';
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
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
}

export default function EditTagPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tag>>({});

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(`/api/tags/${id}`);
        if (!response.ok) throw new Error('Failed to fetch tag');
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tag');
      } finally {
        setLoading(false);
      }
    };
    fetchTag();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update tag');
      }

      router.push('/app/tags');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this tag? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      router.push('/app/tags');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
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

  if (!formData._id) {
    return (
      <Container>
        <Alert severity="error">Tag not found</Alert>
        <Link href="/app/tags" passHref>
          <Button sx={{ mt: 2 }} component="a">
            Back to Tags
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Edit Tag
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
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={formData.slug || ''}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                multiline
                rows={2}
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category || 'topic'}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  label="Category"
                >
                  <MenuItem value="topic">Topic</MenuItem>
                  <MenuItem value="platform">Platform</MenuItem>
                  <MenuItem value="audience">Audience</MenuItem>
                  <MenuItem value="format">Format</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="space-between">
                <Stack direction="row" spacing={2}>
                  <Link href="/app/tags" passHref>
                    <Button component="a">Back</Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || !formData.name?.trim()}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </Stack>
                <Button color="error" variant="outlined" onClick={handleDelete} disabled={saving}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
