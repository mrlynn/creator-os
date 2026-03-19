'use client';

import Image from 'next/image';
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
  ListSubheader,
  SwipeableDrawer,
  Typography,
  Divider,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import { navGroups, SIDEBAR_WIDTH } from './nav-config';

type DrawerVariant = 'permanent' | 'temporary';

interface AppSidebarProps {
  variant?: DrawerVariant;
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

function SidebarContent({ variant, onClose }: { variant: DrawerVariant; onClose?: () => void }) {
  const pathname = usePathname();
  const globalSearch = useGlobalSearch();

  const isActive = (href: string) =>
    pathname === href || (href !== '/app/dashboard' && pathname.startsWith(href));

  return (
    <>
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Image
            src="/creatoros.png"
            alt="Creator OS"
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.3px' }}
          >
            Creator OS
          </Typography>
        </Box>
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

      <Box component="nav" aria-label="Main navigation" sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1, px: 1 }} disablePadding>
          {navGroups.map((group) => (
            <Box key={group.label || 'system'} component="span">
              {group.label && (
                <ListSubheader sx={{ py: 1, px: 0, lineHeight: 1.5 }} disableSticky>
                  {group.label}
                </ListSubheader>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={item.disabled ? 'div' : Link}
                      href={item.disabled ? undefined : item.href}
                      disabled={item.disabled}
                      selected={active}
                      onClick={variant === 'temporary' ? onClose : undefined}
                      aria-current={active ? 'page' : undefined}
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
                          color: active ? 'inherit' : 'text.secondary',
                        }}
                      >
                        <item.Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </Box>
          ))}
        </List>
      </Box>
    </>
  );
}

const isIOS =
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

export function AppSidebar({ variant = 'permanent', open = true, onClose, onOpen }: AppSidebarProps) {
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

  const content = <SidebarContent variant={variant} onClose={onClose} />;

  if (variant === 'temporary') {
    return (
      <SwipeableDrawer
        variant="temporary"
        open={open}
        onClose={onClose ?? (() => {})}
        onOpen={onOpen ?? (() => {})}
        disableDiscovery={isIOS}
        disableBackdropTransition={!isIOS}
        ModalProps={{ keepMounted: true }}
        sx={drawerSx}
      >
        {content}
      </SwipeableDrawer>
    );
  }

  return (
    <Drawer variant="permanent" open={open} sx={drawerSx}>
      {content}
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
