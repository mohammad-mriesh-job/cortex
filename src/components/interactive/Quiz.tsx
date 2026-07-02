import { useMemo, useState } from 'react';
import { Box, Chip, Paper, Typography, alpha } from '@mui/material';
import QuizIcon from '@mui/icons-material/QuizOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';

import { parseFence } from './parse';
import { MiniMarkdown } from '../markdown/MiniMarkdown';

interface RawOption {
  text: string;
  correct?: boolean;
}
interface RawQuestion {
  q: string;
  options: (string | RawOption)[];
  explain?: string;
}
interface RawConfig {
  title?: string;
  questions?: RawQuestion[];
  q?: string;
  options?: (string | RawOption)[];
  explain?: string;
}

interface Option {
  text: string;
  correct: boolean;
}
interface Question {
  q: string;
  options: Option[];
  explain?: string;
}

function normalize(config: RawConfig): { title?: string; questions: Question[] } {
  const rawQuestions = config.questions ?? (config.q ? [{ q: config.q, options: config.options ?? [], explain: config.explain }] : []);
  const questions = rawQuestions.map((rq) => ({
    q: rq.q,
    explain: rq.explain,
    options: (rq.options ?? []).map((o) =>
      typeof o === 'string' ? { text: o, correct: false } : { text: o.text, correct: !!o.correct },
    ),
  }));
  return { title: config.title, questions };
}

export function Quiz({ raw }: { raw: string }) {
  const { title, questions } = useMemo(() => normalize(parseFence<RawConfig>(raw)), [raw]);
  // selected option index per question (-1 = unanswered)
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));

  const answeredCount = answers.filter((a) => a !== -1).length;
  const correctCount = answers.filter((a, qi) => a !== -1 && questions[qi].options[a]?.correct).length;

  return (
    <Paper variant="outlined" sx={{ my: 3, p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <QuizIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
          {title ?? 'Check your understanding'}
        </Typography>
        {answeredCount > 0 && (
          <Chip
            size="small"
            color={correctCount === questions.length ? 'success' : 'default'}
            label={`${correctCount}/${questions.length}`}
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {questions.map((question, qi) => {
        const chosen = answers[qi];
        const locked = chosen !== -1;
        return (
          <Box key={qi} sx={{ mb: qi < questions.length - 1 ? 3 : 0 }}>
            {questions.length > 1 && (
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Question {qi + 1}
              </Typography>
            )}
            <Box sx={{ fontWeight: 600, mb: 1.5 }}>
              <MiniMarkdown content={question.q} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {question.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const showCorrect = locked && opt.correct;
                const showWrong = locked && isChosen && !opt.correct;
                const color = showCorrect ? 'success' : showWrong ? 'error' : 'primary';
                const tint = (showCorrect || showWrong) ? color : null;
                return (
                  <Box
                    key={oi}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    onClick={() => !locked && setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    onKeyDown={(e) => {
                      if (!locked && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      border: '1.5px solid',
                      borderColor: tint ? `${tint}.main` : 'divider',
                      bgcolor: (t) => (tint ? alpha(t.palette[tint].main, 0.1) : 'transparent'),
                      cursor: locked ? 'default' : 'pointer',
                      transition: 'border-color .15s, background-color .15s',
                      '&:hover': locked ? {} : { borderColor: 'primary.main', bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ flex: 1, '& p': { my: 0 } }}>
                      <MiniMarkdown content={opt.text} />
                    </Box>
                    {showCorrect && <CheckCircleIcon color="success" fontSize="small" />}
                    {showWrong && <CancelIcon color="error" fontSize="small" />}
                  </Box>
                );
              })}
            </Box>

            {locked && (
              <Box sx={{ mt: 1.5 }}>
                {question.explain && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      borderLeft: '3px solid',
                      borderColor: questions[qi].options[chosen]?.correct ? 'success.main' : 'info.main',
                    }}
                  >
                    <MiniMarkdown content={question.explain} />
                  </Box>
                )}
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? -1 : v)))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setAnswers((a) => a.map((v, i) => (i === qi ? -1 : v)));
                  }}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  <ReplayIcon sx={{ fontSize: 16 }} /> Try again
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Paper>
  );
}
