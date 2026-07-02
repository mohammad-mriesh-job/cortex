import { Suspense, useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';

import { useColorMode } from '../../theme';
import { useProgress } from '../../hooks/useProgress';
import { useActiveTrack } from '../../hooks/useActiveTrack';
import { ACTIVE_TRACK_STORAGE_KEY, DEFAULT_TRACK_SLUG } from '../../modules/registry';
import { progressKey } from '../../utils/progress';
import { Sidebar } from './Sidebar';
import { SearchBox } from './SearchBox';
import { TrackSwitcher } from './TrackSwitcher';
import { Stack } from '../ui/Stack';

const DRAWER_WIDTH = 290;

function Brand({ to }: { to: string }) {
  return (
    <Stack
      component={RouterLink}
      to={to}
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
    >
      <AutoStoriesIcon sx={{ color: 'primary.main' }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 800, display: { xs: 'none', md: 'block' } }}>
        Cortex
      </Typography>
    </Stack>
  );
}

export function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { mode, toggle } = useColorMode();
  const { isDone } = useProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const track = useActiveTrack();

  useEffect(() => {
    if (track) {
      try {
        localStorage.setItem(ACTIVE_TRACK_STORAGE_KEY, track.slug);
      } catch {
        /* ignore */
      }
    }
  }, [track]);

  // Unknown track slug → recover to the default track.
  if (!track) return <Navigate to={`/${DEFAULT_TRACK_SLUG}`} replace />;

  const total = track.allTopics.length;
  const doneCount = track.allTopics.filter((t) => isDone(progressKey(track, t))).length;
  const progressPct = total ? Math.round((doneCount / total) * 100) : 0;

  const drawerContent = (
    <>
      <Toolbar />
      <Sidebar onNavigate={() => setMobileOpen(false)} />
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, width: '100%' }}>
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen((o) => !o)} aria-label="open navigation">
              <MenuIcon />
            </IconButton>
          )}
          <Brand to={`/${track.slug}`} />
          <TrackSwitcher activeTrack={track} />
          <Box sx={{ flexGrow: 1 }} />
          <SearchBox />
          {total > 0 && (
            <Tooltip title={`${doneCount} / ${total} topics complete in ${track.name}`}>
              <Chip
                label={`${progressPct}%`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, display: { xs: 'none', sm: 'flex' } }}
              />
            </Tooltip>
          )}
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggle} aria-label="toggle color mode">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, minWidth: 0 }}
      >
        <Toolbar />
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Box key={location.pathname}>
            <Outlet />
          </Box>
        </Suspense>
      </Box>
    </Box>
  );
}
