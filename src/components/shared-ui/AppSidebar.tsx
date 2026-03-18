'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BarChartIcon from '@mui/icons-material/BarChart';

const SIDEBAR_WIDTH = 220;

const navItems: { label: string; href: string; icon: React.ReactNode; disabled?: boolean }[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Ideas', href: '/app/ideas', icon: <LightbulbIcon fontSize="small" /> },
  { label: 'Scripts', href: '/app/scripts', icon: <ArticleIcon fontSize="small" /> },
  { label: 'Pipeline', href: '/app/pipeline', icon: <ViewKanbanIcon fontSize="small" /> },
  { label: 'Analytics', href: '/app/analytics', icon: <BarChartIcon fontSize="small" /> },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ px: 2, py: 2.5 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.3px' }}
        >
          Creator OS
        </Typography>
      </Box>

      <Divider />

      <List sx={{ pt: 1, px: 1 }} disablePadding>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={item.disabled ? 'div' : Link}
                href={item.disabled ? undefined : item.href}
                disabled={item.disabled}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
