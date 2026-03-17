'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useParams } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

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
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Script>>({});

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
      setError('Please provide an outline first');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/scripts/${scriptId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline: formData.outline, audience: 'beginner' }),
      });

      if (!response.ok) throw new Error('Failed to generate script');
      const { script: updated } = await response.json();
      setScript(updated);
      setFormData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGenerating(false);
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
            />
            <Button
              variant="contained"
              startIcon={<AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <CircularProgress size={20} /> : 'Generate Script with AI'}
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
