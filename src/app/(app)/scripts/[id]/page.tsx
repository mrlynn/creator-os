'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  Stack,
  Tabs,
  Tab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { useParams } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Script {
  _id: string;
  title: string;
  outline?: string;
  hook?: string;
  problem?: string;
  solution?: string;
  demo?: string;
  cta?: string;
  outro?: string;
  status: string;
  wordCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ScriptDetailPage() {
  const params = useParams();
  const scriptId = params.id as string;

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateCountdown, setGenerateCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Script>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastTokensUsed, setLastTokensUsed] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const response = await fetch(`/api/scripts/${scriptId}`);
        if (!response.ok) throw new Error('Failed to fetch script');
        const data = await response.json();
        setScript(data);
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [scriptId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save script');
      const updated = await response.json();
      setScript(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.outline) {
      setGenerateError('Please provide an outline first');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setLastTokensUsed(null);

    // Start countdown timer (GPT-4 typically takes 20-40s for a full script)
    setGenerateCountdown(40);
    countdownRef.current = setInterval(() => {
      setGenerateCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await fetch(`/api/scripts/${scriptId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline: formData.outline, audience: 'beginner' }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Generation failed — check your outline and try again');
      }

      const result = await response.json();
      const updated = result.script;
      const tokensUsed = result.generation?.tokensUsed || null;

      setScript(updated);
      setFormData(updated);
      setLastTokensUsed(tokensUsed);

      const wordCount = updated.wordCount || 0;
      const tokenMsg = tokensUsed ? ` • ${tokensUsed.toLocaleString()} tokens used` : '';
      setSuccessMessage(`Script generated! ${wordCount} words${tokenMsg}`);

      // Switch to sections tab so user sees the result
      setTabValue(1);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setGenerating(false);
      setGenerateCountdown(0);
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

  if (!script) {
    return (
      <Container>
        <Typography color="error">Script not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {script.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {script.wordCount} words • Status: {script.status}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={5000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={successMessage}
        />

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Outline & Generate" />
          <Tab label="Script Sections" />
          <Tab label="Hooks" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Outline"
              name="outline"
              value={formData.outline || ''}
              onChange={handleChange}
              multiline
              rows={6}
              placeholder="Describe what your script should cover..."
              disabled={generating}
            />

            {generating && (
              <Box>
                <LinearProgress sx={{ mb: 1 }} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Generating with GPT-4
                  {generateCountdown > 0 ? ` — about ${generateCountdown}s remaining` : '...'}
                </Typography>
              </Box>
            )}

            {generateError && (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerate}
                  >
                    Retry
                  </Button>
                }
              >
                {generateError}
              </Alert>
            )}

            {lastTokensUsed && !generating && (
              <Typography variant="caption" color="textSecondary">
                Last generation: {lastTokensUsed.toLocaleString()} tokens used
              </Typography>
            )}

            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Script with AI'}
            </Button>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            {['hook', 'problem', 'solution', 'demo', 'cta', 'outro'].map((section) => (
              <Accordion key={section}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {section}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    value={formData[section as keyof Script] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [section]: e.target.value }))
                    }
                    multiline
                    rows={4}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Save Script'}
            </Button>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="textSecondary">
            Hook generation coming soon. Save your script first, then generate hooks.
          </Typography>
        </TabPanel>
      </Box>
    </Container>
  );
}
