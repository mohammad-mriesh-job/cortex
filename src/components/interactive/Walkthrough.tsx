import { useEffect, useMemo, useState } from 'react';
import { Box, IconButton, LinearProgress, Paper, Tooltip, Typography, alpha } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ReplayIcon from '@mui/icons-material/Replay';
import MovieIcon from '@mui/icons-material/SlideshowOutlined';

import { parseFence } from './parse';
import { MiniMarkdown } from '../markdown/MiniMarkdown';

interface Step {
  text?: string;
  array?: Array<number | string>;
  highlight?: number[];
  sorted?: number[];
  pointers?: Record<string, string>;
  line?: number;
}
interface RawConfig {
  title?: string;
  code?: string;
  steps: Step[];
}

export function Walkthrough({ raw }: { raw: string }) {
  const config = useMemo(() => parseFence<RawConfig>(raw), [raw]);
  const steps = config.steps ?? [];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setIdx((i) => i + 1), 1500);
    return () => clearTimeout(id);
  }, [playing, idx, steps.length]);

  if (steps.length === 0) return null;

  const step = steps[idx];
  const codeLines = config.code ? config.code.replace(/\n$/, '').split('\n') : [];

  const go = (n: number) => {
    setPlaying(false);
    setIdx((i) => Math.max(0, Math.min(steps.length - 1, i + n)));
  };

  return (
    <Paper variant="outlined" sx={{ my: 3, p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <MovieIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
          {config.title ?? 'Step-by-step walkthrough'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Step {idx + 1} / {steps.length}
        </Typography>
      </Box>

      {/* Code with active-line highlight */}
      {codeLines.length > 0 && (
        <Box
          component="pre"
          sx={{
            m: 0,
            mb: 2,
            p: 0,
            borderRadius: 2,
            overflow: 'auto',
            bgcolor: '#0d1117',
            border: '1px solid',
            borderColor: 'divider',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            lineHeight: 1.7,
          }}
        >
          {codeLines.map((ln, i) => {
            const active = step.line === i + 1;
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  px: 1.5,
                  borderLeft: '3px solid',
                  borderColor: active ? 'primary.main' : 'transparent',
                  bgcolor: active ? alpha('#f8981d', 0.16) : 'transparent',
                  transition: 'background-color .2s',
                }}
              >
                <Box component="span" sx={{ width: 22, color: 'text.disabled', userSelect: 'none', flexShrink: 0 }}>
                  {i + 1}
                </Box>
                <Box component="span" sx={{ color: '#c9d1d9', whiteSpace: 'pre' }}>
                  {ln || ' '}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Array visualizer */}
      {step.array && step.array.length > 0 && <ArrayScene step={step} />}

      {/* Narration */}
      {step.text && (
        <Box sx={{ mt: 2, minHeight: 24 }}>
          <MiniMarkdown content={step.text} />
        </Box>
      )}

      {/* Controls */}
      <LinearProgress
        variant="determinate"
        value={((idx + 1) / steps.length) * 100}
        sx={{ mt: 2, height: 6, borderRadius: 3 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
        <Tooltip title="Restart">
          <span>
            <IconButton onClick={() => { setPlaying(false); setIdx(0); }} disabled={idx === 0} aria-label="restart">
              <ReplayIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Previous">
          <span>
            <IconButton onClick={() => go(-1)} disabled={idx === 0} aria-label="previous step">
              <SkipPreviousIcon />
            </IconButton>
          </span>
        </Tooltip>
        <IconButton
          color="primary"
          onClick={() => (idx >= steps.length - 1 ? (setIdx(0), setPlaying(true)) : setPlaying((p) => !p))}
          aria-label={playing ? 'pause' : 'play'}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          {playing ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Tooltip title="Next">
          <span>
            <IconButton onClick={() => go(1)} disabled={idx >= steps.length - 1} aria-label="next step">
              <SkipNextIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

function ArrayScene({ step }: { step: Step }) {
  const highlight = new Set(step.highlight ?? []);
  const sorted = new Set(step.sorted ?? []);
  const pointers = step.pointers ?? {};

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', py: 1 }}>
      {(step.array ?? []).map((value, i) => {
        const isHi = highlight.has(i);
        const isSorted = sorted.has(i);
        const tone = isHi ? 'warning' : isSorted ? 'success' : null;
        const pointer = pointers[String(i)];
        return (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
            <Box sx={{ height: 18, fontSize: '0.7rem', fontWeight: 700, color: 'warning.main' }}>
              {pointer ?? ''}
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1.5,
                fontWeight: 700,
                fontFamily: 'monospace',
                border: '2px solid',
                borderColor: tone ? `${tone}.main` : 'divider',
                bgcolor: (t) => (tone ? alpha(t.palette[tone].main, 0.18) : 'background.default'),
                color: tone ? `${tone}.main` : 'text.primary',
                transform: isHi ? 'translateY(-3px)' : 'none',
                transition: 'all .25s',
              }}
            >
              {String(value)}
            </Box>
            <Box sx={{ mt: 0.5, fontSize: '0.68rem', color: 'text.disabled' }}>{i}</Box>
          </Box>
        );
      })}
    </Box>
  );
}
