'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useGlobalSearch } from '@/components/shared-ui/GlobalSearchContext';
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

type DrawerVariant = 'permanent' | 'temporary';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const SIDEBAR_WIDTH = 220;

const navItems: { label: string; href: string; icon: React.ReactNode; disabled?: boolean }[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Ideas', href: '/app/ideas', icon: <LightbulbIcon fontSize="small" /> },
  { label: 'Scripts', href: '/app/scripts', icon: <ArticleIcon fontSize="small" /> },
  { label: 'Pipeline', href: '/app/pipeline', icon: <ViewKanbanIcon fontSize="small" /> },
  { label: 'Library', href: '/app/library', icon: <VideoLibraryIcon fontSize="small" /> },
  { label: 'Series', href: '/app/series', icon: <CollectionsBookmarkIcon fontSize="small" /> },
  { label: 'Tags', href: '/app/tags', icon: <LocalOfferIcon fontSize="small" /> },
  { label: 'AI Toolkit', href: '/app/ai-toolkit', icon: <PsychologyIcon fontSize="small" /> },
  { label: 'Analytics', href: '/app/analytics', icon: <BarChartIcon fontSize="small" /> },
  { label: 'Settings', href: '/app/settings', icon: <SettingsIcon fontSize="small" /> },
  { label: 'Help', href: '/app/help', icon: <HelpOutlineIcon fontSize="small" /> },
];

interface AppSidebarProps {
  variant?: DrawerVariant;
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ variant = 'permanent', open = true, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const globalSearch = useGlobalSearch();

  const drawerSx = {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: SIDEBAR_WIDTH,
      boxSizing: 'border-box',
      borderRight: variant === 'permanent' ? '1px solid' : 'none',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      ...(variant === 'temporary' && {
        top: 56,
        height: 'calc(100vh - 56px)',
      }),
    },
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={variant === 'temporary' ? { keepMounted: true } : undefined}
      sx={drawerSx}
    >
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.3px' }}
        >
          Creator OS
        </Typography>
        {globalSearch && (
          <Tooltip title="Search (⌘K)">
            <IconButton
              size="small"
              onClick={globalSearch.openSearch}
              sx={{ color: 'text.secondary' }}
              aria-label="Open search"
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
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
                onClick={variant === 'temporary' ? onClose : undefined}
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
