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
import { FormControlLabel, Checkbox } from '@mui/material';
import { SearchField } from '@/components/shared-ui/SearchField';

interface InstructionProfile {
  _id: string;
  name: string;
  instructionText: string;
  applicableOperations: string[];
  isDefault: boolean;
}

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

  const [profiles, setProfiles] = useState<InstructionProfile[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    instructionText: '',
    isDefault: false,
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [promptSearch, setPromptSearch] = useState('');
  const [profileSearch, setProfileSearch] = useState('');

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/instruction-profiles');
      if (!res.ok) throw new Error('Failed to fetch profiles');
      const { data } = await res.json();
      setProfiles(data || []);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setProfileLoading(false);
    }
  };

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
    fetchProfiles();
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

  const handleCreateProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.instructionText.trim()) return;
    setProfileSubmitting(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/instruction-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          instructionText: profileForm.instructionText.trim(),
          isDefault: profileForm.isDefault,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create profile');
      }
      setCreateProfileOpen(false);
      setProfileForm({ name: '', instructionText: '', isDefault: false });
      fetchProfiles();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleEditProfile = (p: InstructionProfile) => {
    setEditingProfileId(p._id);
    setProfileForm({
      name: p.name,
      instructionText: p.instructionText,
      isDefault: p.isDefault,
    });
    setEditProfileOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!editingProfileId || !profileForm.name.trim() || !profileForm.instructionText.trim())
      return;
    setProfileSubmitting(true);
    setProfileError(null);
    try {
      const res = await fetch(`/api/instruction-profiles/${editingProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          instructionText: profileForm.instructionText.trim(),
          isDefault: profileForm.isDefault,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile');
      }
      setEditProfileOpen(false);
      setEditingProfileId(null);
      setProfileForm({ name: '', instructionText: '', isDefault: false });
      fetchProfiles();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Delete this instruction profile?')) return;
    try {
      const res = await fetch(`/api/instruction-profiles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchProfiles();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading || profileLoading) {
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

        {profileError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileError(null)}>
            {profileError}
          </Alert>
        )}

        <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 3 }}>
          Instruction Profiles
        </Typography>
        <SearchField
          value={profileSearch}
          onChange={setProfileSearch}
          placeholder="Search profiles..."
          sx={{ mb: 2 }}
        />
        <Paper sx={{ mb: 3 }}>
          {profileLoading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : profiles.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No instruction profiles yet. Create one to prepend persona instructions to AI operations.
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCreateProfileOpen(true)}
              >
                New Profile
              </Button>
            </Box>
          ) : (
            <List>
              {profiles
                .filter(
                  (p) =>
                    !profileSearch.trim() ||
                    p.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
                    (p.instructionText || '').toLowerCase().includes(profileSearch.toLowerCase())
                )
                .map((p) => (
                <ListItem key={p._id} divider>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {p.name}
                        {p.isDefault && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                            }}
                          >
                            Default
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      Array.isArray(p.applicableOperations) && p.applicableOperations.length > 0
                        ? p.applicableOperations.includes('*')
                          ? 'All ops'
                          : p.applicableOperations.join(', ')
                        : 'All ops'
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleEditProfile(p)}
                      aria-label="Edit profile"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteProfile(p._id)}
                      aria-label="Delete profile"
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
          {profiles.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setCreateProfileOpen(true)}
              >
                New Profile
              </Button>
            </Box>
          )}
        </Paper>

        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Prompts
        </Typography>
        <SearchField
          value={promptSearch}
          onChange={setPromptSearch}
          placeholder="Search prompts..."
          sx={{ mb: 2 }}
        />
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
              {prompts
                .filter(
                  (p) =>
                    !promptSearch.trim() ||
                    p.name.toLowerCase().includes(promptSearch.toLowerCase()) ||
                    (p.template || '').toLowerCase().includes(promptSearch.toLowerCase()) ||
                    (p.category || '').toLowerCase().includes(promptSearch.toLowerCase())
                )
                .map((p) => (
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

        <Dialog
          open={createProfileOpen}
          onClose={() => setCreateProfileOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Instruction Profile</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Beginner Persona"
              />
              <TextField
                label="Instruction text"
                fullWidth
                multiline
                rows={6}
                value={profileForm.instructionText}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, instructionText: e.target.value }))
                }
                placeholder="Prepend to AI operations, e.g. You write for developers new to AI..."
                helperText="Max 2000 characters"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profileForm.isDefault}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, isDefault: e.target.checked }))
                    }
                  />
                }
                label="Use as default profile"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateProfileOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateProfile}
              disabled={
                profileSubmitting ||
                !profileForm.name.trim() ||
                !profileForm.instructionText.trim()
              }
            >
              {profileSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Instruction Profile</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <TextField
                label="Instruction text"
                fullWidth
                multiline
                rows={6}
                value={profileForm.instructionText}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, instructionText: e.target.value }))
                }
                helperText="Max 2000 characters"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profileForm.isDefault}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, isDefault: e.target.checked }))
                    }
                  />
                }
                label="Use as default profile"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdateProfile}
              disabled={
                profileSubmitting ||
                !profileForm.name.trim() ||
                !profileForm.instructionText.trim()
              }
            >
              {profileSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
