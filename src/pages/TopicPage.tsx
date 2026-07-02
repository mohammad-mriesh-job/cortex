import { useMemo } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Chip, Divider, Link, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ScheduleIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';

import { useActiveTrack } from '../hooks/useActiveTrack';
import { useProgress } from '../hooks/useProgress';
import { progressKey } from '../utils/progress';
import { extractToc } from '../utils/markdown';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { LevelChip } from '../components/LevelChip';
import { Stack } from '../components/ui/Stack';
import { NotFoundPage } from './NotFoundPage';

export function TopicPage() {
  const params = useParams();
  const slug = params['*'] ?? '';
  const track = useActiveTrack();
  const { isDone, toggle } = useProgress();

  const topic = track?.topicBySlug.get(slug);
  const toc = useMemo(() => (topic ? extractToc(topic.content) : []), [topic]);

  const adjacent = useMemo(() => {
    if (!track || !topic) return {};
    const idx = track.allTopics.findIndex((t) => t.slug === topic.slug);
    return {
      prev: idx > 0 ? track.allTopics[idx - 1] : undefined,
      next: idx >= 0 && idx < track.allTopics.length - 1 ? track.allTopics[idx + 1] : undefined,
    };
  }, [track, topic]);

  if (!track || !topic) return <NotFoundPage />;

  const base = `/${track.slug}`;
  const key = progressKey(track, topic);
  const done = isDone(key);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: { xs: 2, sm: 3, md: 5 }, py: 4 }}>
      <Box sx={{ flex: 1, maxWidth: 860, minWidth: 0 }}>
        <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
          <Link component={RouterLink} to={base} underline="hover" color="inherit">
            {track.name}
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {topic.category}
          </Typography>
        </Breadcrumbs>

        <Typography variant="h3" sx={{ mb: 1.5 }}>
          {topic.title}
        </Typography>

        {topic.summary && (
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 2 }}>
            {topic.summary}
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <LevelChip level={topic.level} />
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
            label={`${topic.readMinutes} min read`}
            size="small"
            variant="outlined"
          />
          {topic.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'action.hover' }} />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            onClick={() => toggle(key)}
            variant={done ? 'contained' : 'outlined'}
            color={done ? 'success' : 'primary'}
            size="small"
            startIcon={done ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
          >
            {done ? 'Completed' : 'Mark complete'}
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <MarkdownRenderer content={topic.content} />

        <Divider sx={{ my: 4 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
          {adjacent.prev ? (
            <Button
              component={RouterLink}
              to={`${base}/topic/${adjacent.prev.slug}`}
              startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', flex: 1 }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Previous
                </Typography>
                {adjacent.prev.title}
              </Box>
            </Button>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
          {adjacent.next ? (
            <Button
              component={RouterLink}
              to={`${base}/topic/${adjacent.next.slug}`}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              sx={{ justifyContent: 'flex-end', textTransform: 'none', flex: 1 }}
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Next
                </Typography>
                {adjacent.next.title}
              </Box>
            </Button>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
        </Stack>
      </Box>

      <Box sx={{ display: { xs: 'none', lg: 'block' }, width: 240, flexShrink: 0, ml: 4 }}>
        <Box sx={{ position: 'sticky', top: 88 }}>
          <TableOfContents items={toc} />
        </Box>
      </Box>
    </Box>
  );
}
