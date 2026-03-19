'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import { SearchField } from '@/components/shared-ui/SearchField';
import { ListSkeleton } from '@/components/shared-ui/ListSkeleton';

interface Script {
  _id: string;
  title: string;
  status: string;
  wordCount: number;
  createdAt: string;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchScripts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search.trim()) params.append('q', search.trim());
      const response = await fetch(`/api/scripts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scripts');
      const { data } = await response.json();
      setScripts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Scripts
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {scripts.length} script{scripts.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <SearchField value={search} onChange={setSearch} placeholder="Search scripts..." />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="outline">Outline</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="final">Final</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <ListSkeleton count={6} variant="row" />
        ) : scripts.length === 0 ? (
          <Typography color="textSecondary">No scripts yet. Create one from an idea.</Typography>
        ) : (
          <Stack spacing={2}>
            {scripts.map((script) => (
              <Box
                key={script._id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box
                  component={Link}
                  href={`/app/scripts/${script._id}`}
                  sx={{ flex: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  <Typography variant="h6">{script.title}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {script.wordCount} words
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Status: {script.status}
                    </Typography>
                  </Stack>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!confirm('Delete this script? This cannot be undone.')) return;
                    try {
                      const res = await fetch(`/api/scripts/${script._id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Failed to delete');
                      setSuccessMessage('Script deleted');
                      fetchScripts();
                    } catch {
                      setError('Failed to delete script');
                    }
                  }}
                  aria-label="Delete"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={successMessage}
        />
      </Box>
    </Container>
  );
}
