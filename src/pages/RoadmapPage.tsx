import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Container, Paper, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/MapOutlined';

import { useActiveTrack } from '../hooks/useActiveTrack';
import { useProgress } from '../hooks/useProgress';
import { progressKey } from '../utils/progress';
import { levelColor } from '../utils/levels';
import { Stack } from '../components/ui/Stack';
import { NotFoundPage } from './NotFoundPage';

export function RoadmapPage() {
  const track = useActiveTrack();
  const { isDone } = useProgress();

  if (!track) return <NotFoundPage />;

  if (track.categories.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <MapIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5">No roadmap yet</Typography>
        <Typography color="text.secondary">The {track.name} track is coming soon.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <MapIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography variant="h3">Learning Roadmap</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Follow the modules in order — each builds on the last. Green checks mark what you’ve completed.
      </Typography>

      <Box sx={{ position: 'relative', pl: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 11, sm: 15 },
            top: 12,
            bottom: 12,
            width: 2,
            bgcolor: 'divider',
          }}
        />
        {track.categories.map((category, idx) => {
          const doneCount = category.topics.filter((t) => isDone(progressKey(track, t))).length;
          const complete = doneCount === category.topics.length && category.topics.length > 0;
          return (
            <Box key={category.slug} sx={{ position: 'relative', mb: 3 }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: -24, sm: -29 },
                  top: 18,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: complete ? 'success.main' : 'background.paper',
                  color: complete ? '#fff' : 'text.secondary',
                  border: '2px solid',
                  borderColor: complete ? 'success.main' : 'divider',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  zIndex: 1,
                }}
              >
                {complete ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : idx + 1}
              </Box>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {category.name}
                  </Typography>
                  <Chip
                    label={`${doneCount}/${category.topics.length}`}
                    size="small"
                    color={complete ? 'success' : 'default'}
                    variant={complete ? 'filled' : 'outlined'}
                  />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {category.topics.map((topic) => {
                    const done = isDone(progressKey(track, topic));
                    return (
                      <Tooltip key={topic.slug} title={topic.level} arrow>
                        <Chip
                          component={RouterLink}
                          to={`/${track.slug}/topic/${topic.slug}`}
                          clickable
                          label={topic.title}
                          size="small"
                          icon={
                            done ? (
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main !important' }} />
                            ) : undefined
                          }
                          sx={{
                            borderLeft: '3px solid',
                            borderLeftColor: `${levelColor(topic.level)}.main`,
                            borderRadius: 1,
                            fontWeight: done ? 600 : 400,
                            opacity: done ? 1 : 0.9,
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
