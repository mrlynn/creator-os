'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Grid,
  CircularProgress,
  Button,
  Link,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import BarChartIcon from '@mui/icons-material/BarChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';

interface Stats {
  ideasCount: number;
  scriptsCount: number;
  episodesCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ ideasCount: 0, scriptsCount: 0, episodesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ideasRes, scriptsRes, episodesRes] = await Promise.all([
          fetch('/api/ideas?limit=1'),
          fetch('/api/scripts?limit=1'),
          fetch('/api/episodes?limit=1'),
        ]);

        const [ideas, scripts, episodes] = await Promise.all([
          ideasRes.json(),
          scriptsRes.json(),
          episodesRes.json(),
        ]);

        setStats({
          ideasCount: ideas.pagination?.total || 0,
          scriptsCount: scripts.pagination?.total || 0,
          episodesCount: episodes.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      label: 'New Idea',
      href: '/app/ideas/new',
      icon: <LightbulbIcon />,
      color: 'primary',
    },
    {
      label: 'View Ideas',
      href: '/app/ideas',
      icon: <LightbulbIcon />,
      color: 'default',
    },
    {
      label: 'View Scripts',
      href: '/app/scripts',
      icon: <ArticleIcon />,
      color: 'default',
    },
    {
      label: 'Pipeline',
      href: '/app/pipeline',
      icon: <BarChartIcon />,
      color: 'default',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    {stats.ideasCount}
                  </Typography>
                  <Typography variant="body1">
                    Total Ideas
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    {stats.scriptsCount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Scripts
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    {stats.episodesCount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Episodes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Quick Actions
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.color === 'primary' ? 'contained' : 'outlined'}
                  color={action.color === 'primary' ? 'primary' : 'secondary'}
                  startIcon={action.icon}
                  onClick={() => router.push(action.href)}
                  sx={{ py: 1.5, px: 3 }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>

            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>

              <Stack spacing={2}>
                <Typography variant="body1">
                  <Link href="https://github.com/mrlynn/ai-creator-os" target="_blank" underline="hover">
                    Creator OS
                  </Link>{' '}
                  is your content creation platform. Build your content pipeline from ideas to publishing.
                </Typography>

                <Typography variant="body1">
                  <strong>Current flow:</strong> Create an idea → Generate a script with AI → Create an episode → Track in pipeline
                </Typography>

                <Button component={NextLink} href="/app/help" variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
                  View full documentation
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
