'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { CreateIdeaInput } from '@/lib/db/schemas';
import { TagSelector } from '@/components/tags/TagSelector';
import { VoiceInputButton } from '@/components/ideas/VoiceInputButton';

export function IdeaCaptureForm() {
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateIdeaInput>({
    title: '',
    description: '',
    platform: 'youtube',
    audience: 'beginner',
    format: 'tutorial',
    tags: [],
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVoiceResult = (text: string) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description ? `${prev.description} ${text}` : text,
    }));
    setTimeout(() => descriptionInputRef.current?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create idea');
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        platform: 'youtube',
        audience: 'beginner',
        format: 'tutorial',
        tags: [],
      });

      // Reset success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Idea created successfully!</Alert>}

      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        margin="normal"
      />

      <Box sx={{ mt: 2, mb: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Box component="label" htmlFor="description" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Description *
          </Box>
          <VoiceInputButton onResult={handleVoiceResult} disabled={loading} />
        </Stack>
        <TextField
          fullWidth
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          multiline
          rows={4}
          placeholder="Describe your idea..."
          inputRef={descriptionInputRef}
        />
      </Box>

      <FormControl fullWidth margin="normal">
        <InputLabel>Platform</InputLabel>
        <Select
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          label="Platform"
        >
          <MenuItem value="youtube">YouTube</MenuItem>
          <MenuItem value="tiktok">TikTok</MenuItem>
          <MenuItem value="long-form">Long-form</MenuItem>
          <MenuItem value="multi">Multi-platform</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Audience</InputLabel>
        <Select
          name="audience"
          value={formData.audience}
          onChange={handleChange}
          label="Audience"
        >
          <MenuItem value="beginner">Beginner</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
          <MenuItem value="mixed">Mixed</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Format</InputLabel>
        <Select
          name="format"
          value={formData.format}
          onChange={handleChange}
          label="Format"
        >
          <MenuItem value="tutorial">Tutorial</MenuItem>
          <MenuItem value="story">Story</MenuItem>
          <MenuItem value="demo">Demo</MenuItem>
          <MenuItem value="interview">Interview</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, mb: 1 }}>
        <TagSelector
          value={formData.tags || []}
          onChange={(ids) => setFormData((p) => ({ ...p, tags: ids }))}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Idea'}
      </Button>
    </Box>
  );
}
