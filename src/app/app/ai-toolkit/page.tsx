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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Link from 'next/link';

interface Prompt {
  _id: string;
  name: string;
  template: string;
  variables: string[];
  category?: string;
}

export default function AiToolkitPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', template: '', category: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      if (!res.ok) throw new Error('Failed to fetch');
      const { data } = await res.json();
      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.template.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          template: form.template.trim(),
          category: form.category.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create');
      }
      setCreateOpen(false);
      setForm({ name: '', template: '', category: '' });
      fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: Prompt) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      template: p.template,
      category: p.category || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim() || !form.template.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          template: form.template.trim(),
          category: form.category.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update');
      }
      setEditOpen(false);
      setEditingId(null);
      setForm({ name: '', template: '', category: '' });
      fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
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
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1">
            AI Toolkit
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            New Prompt
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper>
          {prompts.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No prompts yet. Create one with {'{{variable}}'} slots.
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Create Prompt
              </Button>
            </Box>
          ) : (
            <List>
              {prompts.map((p) => (
                <ListItem key={p._id} divider>
                  <ListItemText
                    primary={p.name}
                    secondary={
                      p.variables?.length
                        ? `Variables: ${p.variables.join(', ')}`
                        : 'No variables'
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      component={Link}
                      href={`/app/ai-toolkit/${p._id}`}
                      aria-label="Run"
                      size="small"
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEdit(p)}
                      aria-label="Edit"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(p._id)}
                      aria-label="Delete"
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Prompt</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Hook Generator"
              />
              <TextField
                label="Template"
                fullWidth
                multiline
                rows={6}
                value={form.template}
                onChange={(e) => setForm((p) => ({ ...p, template: e.target.value }))}
                placeholder="Use {{variable}} for inputs, e.g. {{title}}"
              />
              <TextField
                label="Category (optional)"
                fullWidth
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={submitting || !form.name.trim() || !form.template.trim()}
            >
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <TextField
                label="Template"
                fullWidth
                multiline
                rows={6}
                value={form.template}
                onChange={(e) => setForm((p) => ({ ...p, template: e.target.value }))}
              />
              <TextField
                label="Category (optional)"
                fullWidth
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={submitting || !form.name.trim() || !form.template.trim()}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
