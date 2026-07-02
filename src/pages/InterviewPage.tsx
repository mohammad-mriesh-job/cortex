import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuizIcon from '@mui/icons-material/QuizOutlined';

import type { Difficulty } from '../types';
import { useActiveTrack } from '../hooks/useActiveTrack';
import { difficultyColor } from '../utils/levels';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { Stack } from '../components/ui/Stack';
import { NotFoundPage } from './NotFoundPage';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export function InterviewPage() {
  const track = useActiveTrack();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [category, setCategory] = useState<string>('All');

  const questions = track?.questions ?? [];

  const allCategories = useMemo(
    () => ['All', ...[...new Set(questions.map((q) => q.category))].sort()],
    [questions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((item) => {
      if (difficulty !== 'All' && item.difficulty !== difficulty) return false;
      if (category !== 'All' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [questions, query, difficulty, category]);

  if (!track) return <NotFoundPage />;

  if (questions.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5">No questions yet</Typography>
        <Typography color="text.secondary">
          The {track.name} question bank is coming soon.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <QuizIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography variant="h3">Interview Questions</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {questions.length} curated {track.name} questions. Read the question, try to answer out loud, then
        expand to check yourself.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search questions, answers, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <ToggleButtonGroup size="small" exclusive value={difficulty} onChange={(_, v) => v && setDifficulty(v)}>
            <ToggleButton value="All">All</ToggleButton>
            {DIFFICULTIES.map((d) => (
              <ToggleButton key={d} value={d}>
                {d}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {allCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Showing {filtered.length} question{filtered.length === 1 ? '' : 's'}
      </Typography>

      {filtered.map((item) => (
        <Accordion
          key={item.id}
          disableGutters
          sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}
          variant="outlined"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, pr: 1 }}>
              <Chip
                label={item.difficulty}
                size="small"
                color={difficultyColor(item.difficulty)}
                sx={{ fontWeight: 700, minWidth: 64 }}
              />
              <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
            <MarkdownRenderer content={item.answer} />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip label={item.category} size="small" variant="outlined" />
              {item.tags.map((t) => (
                <Chip key={t} label={t} size="small" sx={{ bgcolor: 'action.hover' }} />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>No questions match your filters.</Typography>
        </Box>
      )}
    </Container>
  );
}
