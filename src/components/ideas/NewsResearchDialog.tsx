'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AddIcon from '@mui/icons-material/Add';

interface NewsResearchIdea {
  title: string;
  description: string;
  platform: string;
  audience: string;
  format: string;
}

interface NewsResearchResult {
  summary: string;
  ideas: NewsResearchIdea[];
}

interface NewsResearchDialogProps {
  open: boolean;
  onClose: () => void;
  onIdeaCreated?: () => void;
}

export function NewsResearchDialog({ open, onClose, onIdeaCreated }: NewsResearchDialogProps) {
  const [topicsInput, setTopicsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewsResearchResult | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const handleResearch = async () => {
    const topics = topicsInput
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (topics.length === 0) {
      setError('Enter at least one company or topic');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ai/news-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Research failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdea = async (idea: NewsResearchIdea, index: number) => {
    setSavingId(index);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          platform: idea.platform,
          audience: idea.audience,
          format: idea.format,
          tags: [],
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onIdeaCreated?.();
      setResult((prev) =>
        prev ? { ...prev, ideas: prev.ideas.filter((_, i) => i !== index) } : null
      );
    } catch {
      setError('Failed to save idea');
    } finally {
      setSavingId(null);
    }
  };

  const handleClose = () => {
    setTopicsInput('');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NewspaperIcon color="primary" />
        News Research
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter companies or topics (comma-separated). We search news, popular YouTube videos, and
          TikTok viral trends to generate a summary with content ideas.
        </Typography>

        <TextField
          fullWidth
          label="Companies or topics"
          placeholder="e.g. OpenAI, AI agents, Claude, coding tutorials"
          value={topicsInput}
          onChange={(e) => setTopicsInput(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {result && !loading && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {result.summary}
              </Typography>
            </Box>

            {result.ideas.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Suggested ideas
                </Typography>
                <Stack spacing={1.5}>
                  {result.ideas.map((idea, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {idea.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {idea.description}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                        <Chip label={idea.platform} size="small" variant="outlined" />
                        <Chip label={idea.audience} size="small" variant="outlined" />
                        <Chip label={idea.format} size="small" variant="outlined" />
                      </Stack>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={
                          savingId === i ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <AddIcon />
                          )
                        }
                        onClick={() => handleSaveIdea(idea, i)}
                        disabled={savingId !== null}
                      >
                        Save as idea
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Close</Button>
        {!result && (
          <Button
            variant="contained"
            onClick={handleResearch}
            disabled={loading || !topicsInput.trim()}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <NewspaperIcon />}
          >
            Research
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
