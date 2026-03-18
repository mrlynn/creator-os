'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, useMediaQuery } from '@mui/material';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Box,
  Stack,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchResult {
  _id: string;
  title: string;
  description?: string;
  score?: number;
}

interface SearchResponse {
  ideas: SearchResult[];
  episodes: SearchResult[];
  scripts: SearchResult[];
}

const DEBOUNCE_MS = 300;
const TRUNCATE_LEN = 60;

function truncate(str: string | undefined, len: number): string {
  if (!str) return '';
  return str.length <= len ? str : str.slice(0, len) + '…';
}

export function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [input, setInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(input.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const search = useCallback(async (query: string) => {
    if (!query) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Search failed');
      }
      const data = await res.json();
      setResults({
        ideas: data.ideas || [],
        episodes: data.episodes || [],
        scripts: data.scripts || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      setResults(null);
      setError(null);
    }
  }, [debouncedQuery, search]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const hasResults =
    results &&
    (results.ideas.length > 0 ||
      results.episodes.length > 0 ||
      results.scripts.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          ...(isMobile
            ? { borderRadius: 0 }
            : {
                mt: 8,
                maxHeight: '70vh',
                borderRadius: 2,
              }),
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            autoFocus
            size="medium"
            placeholder="Search ideas, episodes, scripts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={24} />
                </InputAdornment>
              ) : null,
            }}
          />
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {error}
            </Typography>
          )}
        </Box>

        <Box sx={{ maxHeight: 360, overflow: 'auto', p: 2 }}>
          {!debouncedQuery && (
            <Typography variant="body2" color="text.secondary">
              Type to search by meaning across ideas, episodes, and scripts.
            </Typography>
          )}
          {debouncedQuery && results && !loading && (
            <>
              {hasResults ? (
                <Stack spacing={2}>
                  {results.ideas.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Ideas
                      </Typography>
                      <List dense disablePadding>
                        {results.ideas.map((item) => (
                          <ListItemButton
                            key={`idea-${item._id}`}
                            onClick={() => handleSelect(`/app/ideas/${item._id}`)}
                            sx={{ borderRadius: 1, mb: 0.5 }}
                          >
                            <ListItemText
                              primary={item.title}
                              secondary={item.description ? truncate(item.description, TRUNCATE_LEN) : null}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  )}
                  {results.episodes.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Episodes
                      </Typography>
                      <List dense disablePadding>
                        {results.episodes.map((item) => (
                          <ListItemButton
                            key={`episode-${item._id}`}
                            onClick={() => handleSelect(`/app/library/${item._id}`)}
                            sx={{ borderRadius: 1, mb: 0.5 }}
                          >
                            <ListItemText
                              primary={item.title}
                              secondary={item.description ? truncate(item.description, TRUNCATE_LEN) : null}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  )}
                  {results.scripts.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Scripts
                      </Typography>
                      <List dense disablePadding>
                        {results.scripts.map((item) => (
                          <ListItemButton
                            key={`script-${item._id}`}
                            onClick={() => handleSelect(`/app/scripts/${item._id}`)}
                            sx={{ borderRadius: 1, mb: 0.5 }}
                          >
                            <ListItemText
                              primary={item.title}
                              secondary={item.description ? truncate(item.description, TRUNCATE_LEN) : null}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">No results</Typography>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
