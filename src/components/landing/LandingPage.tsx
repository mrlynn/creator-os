'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  alpha,
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import ArticleIcon from '@mui/icons-material/Article';
import { useTheme } from '@mui/material/styles';

const features = [
  {
    icon: <LightbulbOutlinedIcon sx={{ fontSize: 36 }} />,
    title: 'Ideas to Scripts',
    description:
      'Capture content ideas and transform them into structured scripts with AI. Target any platform—YouTube, TikTok, Reels, or long-form.',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 36 }} />,
    title: 'AI Script Generation',
    description:
      'Generate hooks, sections, and full scripts from outlines. Refine with audience targeting and platform-specific formatting.',
  },
  {
    icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 36 }} />,
    title: 'Episodes & Library',
    description:
      'Turn scripts into episodes ready for production. Organize your content library with tags, series, and semantic search.',
  },
  {
    icon: <PublishIcon sx={{ fontSize: 36 }} />,
    title: 'Multi-Platform Publishing',
    description:
      'Track publishing across platforms. Manage your content distribution from idea to publication in one place.',
  },
];

const platforms = [
  { name: 'YouTube', icon: <YouTubeIcon sx={{ fontSize: 24 }} /> },
  { name: 'TikTok', icon: <MusicNoteIcon sx={{ fontSize: 24 }} /> },
  { name: 'Reels', icon: <SlideshowIcon sx={{ fontSize: 24 }} /> },
  { name: 'Long-form', icon: <ArticleIcon sx={{ fontSize: 24 }} /> },
];

export function LandingPage() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header - glass morphism */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          py: 2,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.5),
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontFamily: 'var(--font-sora), sans-serif',
            }}
          >
            Creator OS
          </Typography>
        </Box>
        <Button
          variant="outlined"
          component={Link}
          href="/login"
          size="medium"
          sx={{
            borderWidth: 2,
            '&:hover': { borderWidth: 2 },
          }}
        >
          Sign in
        </Button>
      </Box>

      {/* Hero - dark gradient with depth */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 14 },
          background: `linear-gradient(165deg, #0f0f12 0%, #1a1a24 40%, #12121a 100%)`,
          color: '#fff',
        }}
      >
        {/* Decorative gradient orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${alpha('#fff', 0.02)} 1px, transparent 1px),
                             linear-gradient(90deg, ${alpha('#fff', 0.02)} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 0.5,
                mb: 3,
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: alpha('#fff', 0.7),
                border: '1px solid',
                borderColor: alpha('#fff', 0.15),
                borderRadius: 100,
              }}
            >
              AI-Powered Content Creation
            </Typography>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: 'var(--font-sora), sans-serif',
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
                fontWeight: 700,
                lineHeight: 1.15,
                mb: 2,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              Your social presence,<br />
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                on autopilot
              </Box>
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{
                fontWeight: 400,
                mb: 4,
                lineHeight: 1.6,
                color: alpha('#fff', 0.75),
                maxWidth: 560,
                mx: 'auto',
              }}
            >
              For anyone who wants to create and manage a social media presence.
              Transform ideas into scripts, scripts into episodes, and publish
              across every platform—with AI at every stage.
            </Typography>

            {/* Platform badges */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                justifyContent: 'center',
                mb: 4,
              }}
            >
              {platforms.map((p) => (
                <Box
                  key={p.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: alpha('#fff', 0.06),
                    border: '1px solid',
                    borderColor: alpha('#fff', 0.1),
                    color: alpha('#fff', 0.8),
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <Box sx={{ opacity: 0.9, display: 'flex', alignItems: 'center' }}>
                    {p.icon}
                  </Box>
                  {p.name}
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={Link}
                href="/login"
                size="large"
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: `0 4px 24px -4px ${alpha(theme.palette.primary.main, 0.5)}`,
                  '&:hover': {
                    boxShadow: `0 8px 32px -4px ${alpha(theme.palette.primary.main, 0.6)}`,
                  },
                }}
              >
                Get started free
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/login"
                size="large"
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderColor: alpha('#fff', 0.3),
                  color: '#fff',
                  '&:hover': {
                    borderColor: alpha('#fff', 0.5),
                    background: alpha('#fff', 0.05),
                  },
                }}
              >
                Sign in
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontFamily: 'var(--font-sora), sans-serif',
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              From idea to publish
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 480, mx: 'auto' }}
            >
              One workflow. Every platform. AI assistance at every step.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    background: theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      boxShadow: `0 12px 40px -12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sora), sans-serif',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              background: theme.palette.background.paper,
              boxShadow: `0 24px 48px -12px ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: 'text.primary',
                fontFamily: 'var(--font-sora), sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              Start creating today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}
            >
              Join creators who ship content faster with AI-powered workflows.
              No credit card required.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/login"
              size="large"
              sx={{ px: 4, py: 1.5, fontWeight: 600 }}
            >
              Get started free
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
