'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PlatformConnection {
  _id: string;
  platform: string;
  platformUserId?: string;
  platformUsername?: string;
  expiresAt?: string;
}

export default function SettingsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectLoading, setDisconnectLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/platform-connections');
        if (res.ok) {
          const data = await res.json();
          setConnections(Array.isArray(data) ? data : []);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.message || err.error || 'Failed to load connections');
        }
      } catch {
        setError('Failed to load connections');
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  useEffect(() => {
    const youtubeConnected = searchParams.get('youtube_connected');
    const youtubeError = searchParams.get('youtube_error');

    if (youtubeConnected === '1') {
      setSnackbar('YouTube connected successfully');
      setConnections((prev) => {
        if (prev.some((c) => c.platform === 'youtube')) return prev;
        return [...prev, { _id: 'temp', platform: 'youtube' }];
      });
      window.history.replaceState({}, '', '/app/settings');
    }
    if (youtubeError) {
      setError(`YouTube: ${decodeURIComponent(youtubeError)}`);
      window.history.replaceState({}, '', '/app/settings');
    }
  }, [searchParams]);

  const handleDisconnect = async (platform: string) => {
    setDisconnectLoading(platform);
    setError(null);
    try {
      const res = await fetch(`/api/platform-connections?platform=${platform}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.platform !== platform));
        setSnackbar(`${platform === 'youtube' ? 'YouTube' : 'TikTok'} disconnected`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to disconnect ${platform}`);
      }
    } catch {
      setError(`Failed to disconnect ${platform}`);
    } finally {
      setDisconnectLoading(null);
    }
  };

  const youtubeConnected = connections.some((c) => c.platform === 'youtube');

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Publishing connections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Connect your YouTube and TikTok accounts to upload videos directly from Creator OS.
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">YouTube</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {youtubeConnected ? 'Connected' : 'Not connected'}
                  </Typography>
                </Box>
                {youtubeConnected ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDisconnect('youtube')}
                    disabled={disconnectLoading === 'youtube'}
                    startIcon={
                      disconnectLoading === 'youtube' ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {disconnectLoading === 'youtube' ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    component={Link}
                    href="/api/auth/youtube/connect"
                    size="small"
                  >
                    Connect YouTube
                  </Button>
                )}
              </Box>
            </Stack>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
