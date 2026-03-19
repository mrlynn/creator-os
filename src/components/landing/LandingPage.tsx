'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import PublishIcon from '@mui/icons-material/Publish';

const features = [
  {
    icon: <LightbulbOutlinedIcon sx={{ fontSize: 40 }} />,
    title: 'Ideas to Scripts',
    description:
      'Capture content ideas and transform them into structured scripts with AI assistance. Target YouTube, TikTok, and long-form channels.',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
    title: 'AI Script Generation',
    description:
      'Generate hooks, sections, and full scripts from outlines. Refine with audience-level targeting and platform-specific formatting.',
  },
  {
    icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 40 }} />,
    title: 'Episodes & Library',
    description:
      'Turn scripts into episodes ready for production. Organize your content library with tags, series, and semantic search.',
  },
  {
    icon: <PublishIcon sx={{ fontSize: 40 }} />,
    title: 'Multi-Platform Publishing',
    description:
      'Track publishing across platforms. Manage your content distribution from idea to publication in one place.',
  },
];

export function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Image
            src="/creatoros.png"
            alt="Creator OS"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Creator OS
          </Typography>
        </Box>
        <Button
          variant="outlined"
          component={Link}
          href="/login"
          size="medium"
        >
          Sign in
        </Button>
      </Box>

      {/* Hero */}
      <Box
        component="section"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 2,
                color: 'text.primary',
              }}
            >
              AI-Powered Content Creation for Developer Advocates
            </Typography>
            <Typography
              variant="h5"
              component="p"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                mb: 4,
                lineHeight: 1.5,
              }}
            >
              Transform ideas into scripts, scripts into episodes, and publish
              across YouTube, TikTok, and long-form channels—with AI assistance
              at every stage.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/login"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Get started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 10 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'text.primary',
            }}
          >
            From idea to publish
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: 2,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: 1,
              borderColor: 'primary.light',
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}
            >
              Start creating today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}
            >
              Join developer advocates who ship content faster with AI-powered
              workflows.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/login"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Get started
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
