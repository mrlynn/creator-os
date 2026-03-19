'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { SearchField } from '@/components/shared-ui/SearchField';

interface SeriesItem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  episodeCount: number;
  createdAt: string;
}

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      if (search.trim()) params.append('q', search.trim());
      const response = await fetch(`/api/series?${params}`);
      if (!response.ok) throw new Error('Failed to fetch series');
      const { data } = await response.json();
      setSeries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [status, search]);

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this series?')) return;
    try {
      const res = await fetch(`/api/series/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive');
      setSuccessMessage('Series archived');
      fetchSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive');
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
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
            Series
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} href="/app/series/new">
            Add Series
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
          <SearchField value={search} onChange={setSearch} placeholder="Search series..." />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {series.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No series yet. Create your first series to organize episodes.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }} component={Link} href="/app/series/new">
              Add Series
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Episodes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {series.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>{s.title}</TableCell>
                    <TableCell>
                      {s.description
                        ? s.description.length > 60
                          ? `${s.description.slice(0, 60)}...`
                          : s.description
                        : '—'}
                    </TableCell>
                    <TableCell>{STATUS_LABELS[s.status] || s.status}</TableCell>
                    <TableCell align="right">{s.episodeCount ?? 0}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<VisibilityIcon />} component={Link} href={`/app/series/${s._id}`}>
                        View
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleArchive(s._id)}
                        aria-label="Archive"
                        sx={{ ml: 0.5 }}
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
