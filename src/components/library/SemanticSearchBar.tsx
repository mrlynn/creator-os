'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Link,
  Stack,
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
const TRUNCATE_LEN = 80;

function truncate(str: string | undefined, len: number): string {
  if (!str) return '';
  return str.length <= len ? str : str.slice(0, len) + '…';
}

function ResultSection({
  title,
  items,
  basePath,
}: {
  title: string;
  items: SearchResult[];
  basePath: string;
}) {
  if (items.length === 0) return null;
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>
        {items.map((item) => (
          <Link
            key={item._id}
            href={`${basePath}/${item._id}`}
            underline="hover"
            color="inherit"
            sx={{ display: 'block' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.title}
            </Typography>
            {item.description && (
              <Typography variant="caption" color="text.secondary">
                {truncate(item.description, TRUNCATE_LEN)}
              </Typography>
            )}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

export default function SemanticSearchBar() {
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

  const hasResults =
    results &&
    (results.ideas.length > 0 ||
      results.episodes.length > 0 ||
      results.scripts.length > 0);

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search by meaning..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : null,
        }}
      />

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}

      {debouncedQuery && results && !loading && (
        <Paper
          elevation={2}
          sx={{
            mt: 1,
            p: 2,
            maxHeight: 320,
            overflow: 'auto',
          }}
        >
          {hasResults ? (
            <Stack spacing={2}>
              <ResultSection
                title="Ideas"
                items={results.ideas}
                basePath="/app/ideas"
              />
              <ResultSection
                title="Episodes"
                items={results.episodes}
                basePath="/app/library"
              />
              <ResultSection
                title="Scripts"
                items={results.scripts}
                basePath="/app/scripts"
              />
            </Stack>
          ) : (
            <Typography color="text.secondary">No results</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
