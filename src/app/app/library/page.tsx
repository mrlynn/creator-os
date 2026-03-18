'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Grid,
  Pagination,
  Autocomplete,
  TextField,
} from '@mui/material';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import SemanticSearchBar from '@/components/library/SemanticSearchBar';
import { SearchField } from '@/components/shared-ui/SearchField';
import { ListSkeleton } from '@/components/shared-ui/ListSkeleton';

interface Tag {
  _id: string;
  name: string;
  category: string;
}

interface Series {
  _id: string;
  title: string;
}

interface Episode {
  _id: string;
  title: string;
  description?: string;
  publishingStatus?: string;
  editingStatus?: string;
  seriesId?: { _id: string; title: string } | null;
  tags?: { _id: string; name: string }[] | Tag[];
}

const PUBLISHING_STATUSES = ['draft', 'scheduled', 'published', 'archived'];
const EDITING_STATUSES = ['not-started', 'recording', 'editing', 'done'];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
  'not-started': 'Not Started',
  recording: 'Recording',
  editing: 'Editing',
  done: 'Done',
};

export default function LibraryPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    publishingStatus: '',
    editingStatus: '',
    seriesId: '',
    tagIds: [] as string[],
    search: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '20');
      if (filters.publishingStatus) params.append('publishingStatus', filters.publishingStatus);
      if (filters.editingStatus) params.append('editingStatus', filters.editingStatus);
      if (filters.seriesId) params.append('seriesId', filters.seriesId);
      if (filters.tagIds.length > 0) params.append('tags', filters.tagIds.join(','));
      if (filters.search.trim()) params.append('q', filters.search.trim());

      const response = await fetch(`/api/episodes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch episodes');
      const data = await response.json();
      setEpisodes(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, filters.publishingStatus, filters.editingStatus, filters.seriesId, filters.tagIds.join(','), filters.search]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [seriesRes, tagsRes] = await Promise.all([
          fetch('/api/series?status=all'),
          fetch('/api/tags'),
        ]);
        if (seriesRes.ok) {
          const { data } = await seriesRes.json();
          setSeriesList(data || []);
        }
        if (tagsRes.ok) {
          const { data } = await tagsRes.json();
          setTagList(data || []);
        }
      } catch {
        // Optional filters
      }
    };
    fetchOptions();
  }, []);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Content Library
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Browse and filter your episodes.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <SemanticSearchBar />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <SearchField
            value={filters.search}
            onChange={(v) => setFilters((p) => ({ ...p, search: v }))}
            placeholder="Search episodes..."
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Publishing Status</InputLabel>
            <Select
              value={filters.publishingStatus}
              onChange={(e) => setFilters((p) => ({ ...p, publishingStatus: e.target.value }))}
              label="Publishing Status"
            >
              <MenuItem value="">All</MenuItem>
              {PUBLISHING_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Editing Status</InputLabel>
            <Select
              value={filters.editingStatus}
              onChange={(e) => setFilters((p) => ({ ...p, editingStatus: e.target.value }))}
              label="Editing Status"
            >
              <MenuItem value="">All</MenuItem>
              {EDITING_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Series</InputLabel>
            <Select
              value={filters.seriesId}
              onChange={(e) => setFilters((p) => ({ ...p, seriesId: e.target.value }))}
              label="Series"
            >
              <MenuItem value="">All</MenuItem>
              {seriesList.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            multiple
            options={tagList}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name)}
            value={tagList.filter((t) => filters.tagIds.includes(t._id))}
            onChange={(_, newValue) => {
              setFilters((p) => ({ ...p, tagIds: newValue.map((t) => t._id) }));
            }}
            sx={{ minWidth: 200 }}
            renderInput={(params) => (
              <TextField {...params} label="Tags" placeholder="Filter by tags" />
            )}
          />
        </Stack>

        {loading ? (
          <ListSkeleton count={6} variant="card" />
        ) : episodes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No episodes found. Create episodes from scripts to see them here.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2}>
              {episodes.map((ep) => {
                const series = ep.seriesId && typeof ep.seriesId === 'object' ? ep.seriesId : null;
                const tags = ep.tags || [];
                return (
                  <Grid item xs={12} sm={6} md={4} key={ep._id}>
                    <Paper
                      sx={{
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Box
                          component={Link}
                          href={`/app/library/${ep._id}`}
                          sx={{ flex: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {ep.title}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!confirm('Archive this episode?')) return;
                            try {
                              const res = await fetch(`/api/episodes/${ep._id}`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('Failed to archive');
                              fetchEpisodes();
                            } catch {
                              setError('Failed to archive episode');
                            }
                          }}
                          aria-label="Archive"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {ep.description && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {ep.description}
                          </Typography>
                      )}
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                          {ep.publishingStatus && (
                            <Chip
                              label={STATUS_LABELS[ep.publishingStatus] || ep.publishingStatus}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {ep.editingStatus && (
                            <Chip
                              label={STATUS_LABELS[ep.editingStatus] || ep.editingStatus}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {series && (
                            <Chip label={series.title} size="small" variant="outlined" />
                          )}
                          {tags.map((t) => (
                            <Chip
                              key={t._id}
                              label={t.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pagination.pages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
