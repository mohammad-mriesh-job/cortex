import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import QuizIcon from '@mui/icons-material/QuizOutlined';
import MapIcon from '@mui/icons-material/MapOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/FiberManualRecord';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { useActiveTrack } from '../../hooks/useActiveTrack';
import { useProgress } from '../../hooks/useProgress';
import { progressKey } from '../../utils/progress';
import { levelColor } from '../../utils/levels';

function activeCategoryFromPath(pathname: string): string | null {
  // /:trackSlug/topic/:categorySlug/:topicSlug
  const match = /^\/[^/]+\/topic\/([^/]+)\//.exec(pathname);
  return match ? match[1] : null;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { isDone } = useProgress();
  const track = useActiveTrack();
  const activeCat = activeCategoryFromPath(location.pathname);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // When the track changes, default-open the active (or first) category.
  const trackSlug = track?.slug;
  useEffect(() => {
    const initial = activeCat ?? track?.categories[0]?.slug;
    setExpanded(new Set(initial ? [initial] : []));
    // intentionally keyed on the track only, not on every topic navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSlug]);

  // Keep the active category open as you navigate within a track.
  useEffect(() => {
    if (activeCat) setExpanded((prev) => (prev.has(activeCat) ? prev : new Set(prev).add(activeCat)));
  }, [activeCat]);

  if (!track) return null;

  const base = `/${track.slug}`;
  const hasTopics = track.allTopics.length > 0;
  const hasQuestions = track.questions.length > 0;

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const topLinkSx = (active: boolean) => ({
    borderRadius: 1.5,
    mx: 1,
    mb: 0.5,
    color: active ? 'primary.main' : 'text.primary',
    bgcolor: active ? 'action.selected' : 'transparent',
  });

  return (
    <Box sx={{ py: 1, overflowY: 'auto', height: '100%' }}>
      <List dense disablePadding>
        <ListItemButton
          component={RouterLink}
          to={base}
          onClick={onNavigate}
          sx={topLinkSx(location.pathname === base)}
        >
          <ListItemIcon sx={{ minWidth: 38 }}>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Home" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
        </ListItemButton>

        {hasTopics && (
          <ListItemButton
            component={RouterLink}
            to={`${base}/roadmap`}
            onClick={onNavigate}
            sx={topLinkSx(location.pathname === `${base}/roadmap`)}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>
              <MapIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Learning Roadmap" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
          </ListItemButton>
        )}

        {hasQuestions && (
          <ListItemButton
            component={RouterLink}
            to={`${base}/interview`}
            onClick={onNavigate}
            sx={topLinkSx(location.pathname.startsWith(`${base}/interview`))}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>
              <QuizIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Interview Q&A" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
          </ListItemButton>
        )}
      </List>

      <Typography
        variant="overline"
        sx={{ display: 'block', px: 2.5, mt: 2, mb: 0.5, color: 'text.secondary', fontWeight: 700 }}
      >
        Curriculum
      </Typography>

      {!hasTopics && (
        <Box sx={{ px: 2.5, py: 3, color: 'text.secondary', textAlign: 'center' }}>
          <HourglassEmptyIcon sx={{ fontSize: 28, opacity: 0.6, mb: 1 }} />
          <Typography variant="body2">No topics yet.</Typography>
          <Typography variant="caption">This track is coming soon.</Typography>
        </Box>
      )}

      <List dense disablePadding>
        {track.categories.map((category) => {
          const open = expanded.has(category.slug);
          const doneCount = category.topics.filter((t) => isDone(progressKey(track, t))).length;
          return (
            <Box key={category.slug}>
              <ListItemButton onClick={() => toggle(category.slug)} sx={{ mx: 1, borderRadius: 1.5 }}>
                <ListItemText
                  primary={category.name}
                  secondary={`${doneCount}/${category.topics.length}`}
                  slotProps={{
                    primary: { sx: { fontWeight: 700, fontSize: '0.86rem' } },
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
                {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List dense disablePadding sx={{ pb: 0.5 }}>
                  {category.topics.map((topic) => {
                    const to = `${base}/topic/${topic.slug}`;
                    const active = location.pathname === to;
                    const done = isDone(progressKey(track, topic));
                    return (
                      <ListItemButton
                        key={topic.slug}
                        component={RouterLink}
                        to={to}
                        onClick={onNavigate}
                        sx={{
                          pl: 3,
                          ml: 1,
                          mr: 1,
                          borderRadius: 1.5,
                          borderLeft: '2px solid',
                          borderColor: active ? 'primary.main' : 'divider',
                          bgcolor: active ? 'action.selected' : 'transparent',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          {done ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <Tooltip title={topic.level} placement="left">
                              <CircleIcon sx={{ fontSize: 9, color: `${levelColor(topic.level)}.main` }} />
                            </Tooltip>
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={topic.title}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: '0.82rem',
                                fontWeight: active ? 600 : 400,
                                color: active ? 'primary.main' : 'text.primary',
                              },
                            },
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );
}
