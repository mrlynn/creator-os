'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, useMediaQuery } from '@mui/material';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { SIDEBAR_WIDTH } from './nav-config';

export function Footer() {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isApp = pathname?.startsWith('/app');

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        ...(isApp && isDesktop && { ml: SIDEBAR_WIDTH }),
      }}
    >
      <Container maxWidth={isApp ? false : 'lg'} disableGutters={isApp}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'space-between' },
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <MuiLink
              component={Link}
              href="/terms"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Terms of Service
            </MuiLink>
            <Typography component="span" color="text.disabled" sx={{ fontSize: '0.875rem' }}>
              •
            </Typography>
            <MuiLink
              component={Link}
              href="/privacy"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Privacy Statement
            </MuiLink>
          </Box>
          <Typography variant="body2" color="text.disabled">
            © {new Date().getFullYear()} Creator OS
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
