import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Typography,
  alpha,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/QuizOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ConstructionIcon from '@mui/icons-material/Construction';

import { useActiveTrack } from '../hooks/useActiveTrack';
import { useProgress } from '../hooks/useProgress';
import { progressKey } from '../utils/progress';
import { levelColor } from '../utils/levels';
import { LEVELS } from '../types';
import { LevelChip } from '../components/LevelChip';
import { TrackIcon } from '../components/TrackIcon';
import { Stack } from '../components/ui/Stack';
import { NotFoundPage } from './NotFoundPage';

export function HomePage() {
  const track = useActiveTrack();
  const { isDone } = useProgress();

  if (!track) return <NotFoundPage />;

  const base = `/${track.slug}`;
  const total = track.allTopics.length;

  // ---- Coming-soon empty state ----
  if (total === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              mx: 'auto',
              mb: 3,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(track.color, 0.15),
              color: track.color,
            }}
          >
            <TrackIcon trackId={track.id} sx={{ fontSize: 44 }} />
          </Box>
          <Chip
            icon={<ConstructionIcon />}
            label="Coming soon"
            sx={{ mb: 2, fontWeight: 700, bgcolor: alpha(track.color, 0.15), color: track.color }}
          />
          <Typography variant="h4" sx={{ mb: 1 }}>
            {track.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: 'auto' }}>
            {track.tagline} This track is being written — its lessons and interview questions will
            appear here automatically as they’re added.
          </Typography>
          <Button component={RouterLink} to="/java" variant="contained" startIcon={<SchoolIcon />}>
            Explore Java in the meantime
          </Button>
        </Paper>
      </Container>
    );
  }

  // ---- Populated track ----
  const doneCount = track.allTopics.filter((t) => isDone(progressKey(track, t))).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const nextUp = track.allTopics.find((t) => !isDone(progressKey(track, t))) ?? track.allTopics[0];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.background.paper} 0%, ${alpha(track.color, t.palette.mode === 'dark' ? 0.14 : 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TrackIcon trackId={track.id} sx={{ fontSize: 40, color: track.color }} />
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.15em' }}>
            {track.name} · Interview Handbook
          </Typography>
        </Stack>
        <Typography variant="h2" sx={{ fontSize: { xs: '2.1rem', md: '3rem' }, mb: 1.5 }}>
          Master <Box component="span" sx={{ color: track.color }}>{track.name}</Box>, from fundamentals to
          senior depth.
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 760, mb: 3 }}>
          {track.tagline} {track.questions.length}+ interview questions included — plus space to add your own notes.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            component={RouterLink}
            to={`${base}/topic/${nextUp.slug}`}
            variant="contained"
            size="large"
            startIcon={<SchoolIcon />}
          >
            {doneCount > 0 ? 'Continue learning' : 'Start learning'}
          </Button>
          {track.questions.length > 0 && (
            <Button
              component={RouterLink}
              to={`${base}/interview`}
              variant="outlined"
              size="large"
              startIcon={<QuizIcon />}
            >
              Practice interview questions
            </Button>
          )}
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard icon={<MenuBookIcon />} value={String(total)} label="Topics" />
        <StatCard icon={<QuizIcon />} value={`${track.questions.length}`} label="Interview Qs" />
        <StatCard icon={<SchoolIcon />} value={String(track.categories.length)} label="Modules" />
        <StatCard icon={<EmojiEventsIcon />} value={`${pct}%`} label="Your progress" />
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Your journey
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doneCount} / {total} topics complete
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 5 }} />
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          {LEVELS.map((level) => (
            <Stack key={level} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${levelColor(level)}.main` }} />
              <Typography variant="caption" color="text.secondary">
                {level}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Curriculum
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {track.categories.length} modules covering {track.name} end to end.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {track.categories.map((category, idx) => {
          const catDone = category.topics.filter((t) => isDone(progressKey(track, t))).length;
          const catPct = category.topics.length ? Math.round((catDone / category.topics.length) * 100) : 0;
          const levelsInCat = [...new Set(category.topics.map((t) => t.level))];
          return (
            <Card key={category.slug} sx={{ borderRadius: 3 }}>
              <CardActionArea
                component={RouterLink}
                to={`${base}/topic/${category.topics[0]?.slug ?? ''}`}
                sx={{ height: '100%', alignItems: 'stretch' }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Chip
                      label={`Module ${idx + 1}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, mb: 1 }}
                    />
                    {catPct === 100 && <EmojiEventsIcon sx={{ color: 'warning.main' }} />}
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {category.topics.length} topics · {catDone} done
                  </Typography>
                  <LinearProgress variant="determinate" value={catPct} sx={{ height: 6, borderRadius: 3, mb: 1.5 }} />
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {levelsInCat.map((lvl) => (
                      <LevelChip key={lvl} level={lvl} />
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Container>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
      <Box sx={{ color: 'primary.main', mb: 0.5, '& svg': { fontSize: 28 } }}>{icon}</Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}
