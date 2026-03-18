'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface GenerateScriptDialogProps {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  onSuccess: (scriptId: string) => void;
}

export function GenerateScriptDialog({
  open,
  onClose,
  ideaId,
  ideaTitle,
  onSuccess,
}: GenerateScriptDialogProps) {
  const [outline, setOutline] = useState('');
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && ideaId) {
      setOutline('');
      setError(null);
      setLoadingOutline(true);
      fetch(`/api/ideas/${ideaId}/outline`, { method: 'POST' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to generate outline');
          return res.json();
        })
        .then((data) => setOutline(data.outline || ''))
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to generate outline'))
        .finally(() => setLoadingOutline(false));
    }
  }, [open, ideaId]);

  const handleGenerate = async () => {
    if (!outline.trim()) {
      setError('Please provide an outline');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/ideas/${ideaId}/create-and-generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline: outline.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || data.error || `Failed to generate script (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      onSuccess(data.script._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setOutline('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoFixHighIcon color="primary" />
        Generate Script
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          We&apos;ve generated a suggested outline from your idea. Edit it if needed, then generate
          the full script.
        </Typography>

        {loadingOutline ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Generating outline from &quot;{ideaTitle}&quot;...
            </Typography>
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={12}
            label="Outline"
            placeholder="Bullet points for your script..."
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            sx={{ mt: 1 }}
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={generating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loadingOutline || generating || !outline.trim()}
          startIcon={
            generating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <PsychologyIcon />
            )
          }
        >
          {generating ? 'Generating...' : 'Generate Script with AI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
