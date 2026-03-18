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
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', status);
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
  }, [status]);

  const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
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
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Series
          </Typography>
          <Link href="/app/series/new" passHref>
            <Button variant="contained" startIcon={<AddIcon />} component="a">
              Add Series
            </Button>
          </Link>
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

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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
            <Link href="/app/series/new" passHref>
              <Button variant="outlined" sx={{ mt: 2 }} component="a">
                Add Series
              </Button>
            </Link>
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
                      <Link href={`/app/series/${s._id}`} passHref>
                        <Button size="small" startIcon={<VisibilityIcon />} component="a">
                          View
                        </Button>
                      </Link>
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
