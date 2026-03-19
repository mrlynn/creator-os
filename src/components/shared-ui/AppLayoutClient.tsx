'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme, useMediaQuery } from '@mui/material';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AppSidebar } from './AppSidebar';

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/ideas': 'Ideas',
  '/app/scripts': 'Scripts',
  '/app/pipeline': 'Pipeline',
  '/app/library': 'Library',
  '/app/series': 'Series',
  '/app/tags': 'Tags',
  '/app/ai-toolkit': 'AI Toolkit',
  '/app/analytics': 'Analytics',
  '/app/ai-cost': 'AI Cost',
  '/app/settings': 'Settings',
  '/app/help': 'Help',
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || (path !== '/app/dashboard' && pathname.startsWith(path))) {
      return title;
    }
  }
  return 'Creator OS';
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleDrawerClose = () => setMobileOpen(false);
  const handleDrawerOpen = () => setMobileOpen(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppSidebar
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileOpen}
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
      />

      {/* Mobile app bar */}
      {!isDesktop && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            ml: 0,
            zIndex: (t) => t.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 48, sm: 56 } }}>
            <IconButton
              color="inherit"
              aria-label="Open menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1.5 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {getPageTitle(pathname)}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
          pt: isDesktop ? 3 : 8,
          paddingBottom: 'env(safe-area-inset-bottom)',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
