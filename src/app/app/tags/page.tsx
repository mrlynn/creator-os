'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SearchField } from '@/components/shared-ui/SearchField';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search.trim()) params.append('q', search.trim());
      const response = await fetch(`/api/tags?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tags');
      const { data } = await response.json();
      setTags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [category, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      const response = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      setSuccessMessage('Tag deleted');
      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  const CATEGORY_LABELS: Record<string, string> = {
    topic: 'Topic',
    platform: 'Platform',
    audience: 'Audience',
    format: 'Format',
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
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Tags
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} href="/app/tags/new">
            Add Tag
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={successMessage}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <SearchField value={search} onChange={setSearch} placeholder="Search tags..." />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="topic">Topic</MenuItem>
              <MenuItem value="platform">Platform</MenuItem>
              <MenuItem value="audience">Audience</MenuItem>
              <MenuItem value="format">Format</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {tags.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No tags yet. Create your first tag to get started.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }} component={Link} href="/app/tags/new">
              Add Tag
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag._id}>
                    <TableCell>{tag.name}</TableCell>
                    <TableCell>{CATEGORY_LABELS[tag.category] || tag.category}</TableCell>
                    <TableCell>{tag.slug}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" component={Link} href={`/app/tags/${tag._id}`} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tag._id)}
                        color="error"
                        aria-label="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
}
