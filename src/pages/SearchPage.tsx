import { useMemo } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/ArticleOutlined';

import { useActiveTrack } from '../hooks/useActiveTrack';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { LevelChip } from '../components/LevelChip';
import { Stack } from '../components/ui/Stack';
import { difficultyColor } from '../utils/levels';
import { NotFoundPage } from './NotFoundPage';

function plainText(md: string): string {
  return md.replace(/```[\s\S]*?```/g, ' ').replace(/[#`*>_~|-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function snippet(text: string, query: string, len = 180): string {
  const clean = plainText(text);
  const idx = clean.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return clean.slice(0, len) + (clean.length > len ? '…' : '');
  const start = Math.max(0, idx - 60);
  return (start > 0 ? '…' : '') + clean.slice(start, start + len) + '…';
}

export function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const track = useActiveTrack();

  const { topicResults, questionResults } = useMemo(() => {
    const q = query.toLowerCase();
    if (!q || !track) return { topicResults: [], questionResults: [] };

    const topicResults = track.allTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.content.toLowerCase().includes(q),
    );

    const questionResults = track.questions
      .filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
      .slice(0, 25);

    return { topicResults, questionResults };
  }, [query, track]);

  if (!track) return <NotFoundPage />;

  const base = `/${track.slug}`;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Search {track.name}
      </Typography>
      {query ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {topicResults.length + questionResults.length} results for “{query}”
        </Typography>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Type a query in the search box above to search {track.name} topics and questions.
        </Typography>
      )}

      {topicResults.length > 0 && (
        <>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Topics ({topicResults.length})
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1, mb: 4 }}>
            {topicResults.map((t) => (
              <Card key={t.slug} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardActionArea component={RouterLink} to={`${base}/topic/${t.slug}`}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <ArticleIcon fontSize="small" color="primary" />
                      <Typography sx={{ fontWeight: 700 }}>{t.title}</Typography>
                      <LevelChip level={t.level} />
                      <Chip label={t.category} size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {snippet(t.summary || t.content, query)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </>
      )}

      {questionResults.length > 0 && (
        <>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Interview Questions ({questionResults.length})
          </Typography>
          <Box sx={{ mt: 1 }}>
            {questionResults.map((item) => (
              <Accordion key={item.id} disableGutters variant="outlined" sx={{ mb: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                      label={item.difficulty}
                      size="small"
                      color={difficultyColor(item.difficulty)}
                      sx={{ fontWeight: 700, minWidth: 64 }}
                    />
                    <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                  <MarkdownRenderer content={item.answer} />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}

      {query && topicResults.length === 0 && questionResults.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>No results found in {track.name}. Try a different keyword.</Typography>
        </Box>
      )}
    </Container>
  );
}
