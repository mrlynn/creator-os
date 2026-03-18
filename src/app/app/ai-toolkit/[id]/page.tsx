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
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Prompt {
  _id: string;
  name: string;
  template: string;
  variables: string[];
}

export default function PromptRunnerPage() {
  const params = useParams();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [copySnackbar, setCopySnackbar] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`/api/prompts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPrompt(data);
        const vars: Record<string, string> = {};
        (data.variables || []).forEach((v: string) => {
          vars[v] = '';
        });
        setVariables(vars);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prompt');
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, [id]);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setOutput('');
    try {
      const res = await fetch(`/api/prompts/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run');
      setOutput(data.output || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run');
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopySnackbar(true);
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

  if (!prompt) {
    return (
      <Container>
        <Alert severity="error">Prompt not found</Alert>
        <Button sx={{ mt: 2 }} component={Link} href="/app/ai-toolkit" startIcon={<ArrowBackIcon />}>
          Back to AI Toolkit
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/app/ai-toolkit" sx={{ mb: 2 }}>
          Back to AI Toolkit
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {prompt.name}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Variables
          </Typography>
          <Stack spacing={2}>
            {Object.keys(variables).map((key) => (
              <TextField
                key={key}
                label={key}
                fullWidth
                multiline={key.toLowerCase().includes('script') || key.toLowerCase().includes('content')}
                rows={key.toLowerCase().includes('script') ? 4 : 1}
                value={variables[key]}
                onChange={(e) =>
                  setVariables((v) => ({ ...v, [key]: e.target.value }))
                }
                placeholder={`{{${key}}}`}
              />
            ))}
            {Object.keys(variables).length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No variables in this prompt.
              </Typography>
            )}
          </Stack>
          <Button
            variant="contained"
            startIcon={running ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleRun}
            disabled={running}
            sx={{ mt: 2 }}
          >
            {running ? 'Running...' : 'Execute'}
          </Button>
        </Paper>

        {output && (
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Output
              </Typography>
              <IconButton size="small" onClick={handleCopy} aria-label="Copy">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              {output}
            </Box>
          </Paper>
        )}

        <Snackbar
          open={copySnackbar}
          autoHideDuration={2000}
          onClose={() => setCopySnackbar(false)}
          message="Copied to clipboard"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Container>
  );
}
