import { useMemo, useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import FlipIcon from '@mui/icons-material/Flip';

import { parseFence } from './parse';
import { MiniMarkdown } from '../markdown/MiniMarkdown';

interface Card {
  front: string;
  back: string;
}
interface RawConfig {
  title?: string;
  cards: Card[];
}

export function Flashcards({ raw }: { raw: string }) {
  const config = useMemo(() => parseFence<RawConfig>(raw), [raw]);
  const cards = config.cards ?? [];
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;

  const card = cards[order[pos]];

  const go = (delta: number) => {
    setFlipped(false);
    setPos((p) => (p + delta + cards.length) % cards.length);
  };
  const shuffle = () => {
    setFlipped(false);
    setPos(0);
    setOrder((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(((i + 1) * 0.61803398875 + pos) % (i + 1)); // deterministic-ish shuffle
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
  };

  return (
    <Paper variant="outlined" sx={{ my: 3, p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <StyleIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
          {config.title ?? 'Flashcards'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pos + 1} / {cards.length}
        </Typography>
        <IconButton size="small" onClick={shuffle} aria-label="shuffle">
          <ShuffleIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Flip card */}
      <Box
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        sx={{ perspective: '1200px', cursor: 'pointer', outline: 'none' }}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: 160,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s',
            transform: flipped ? 'rotateY(180deg)' : 'none',
          }}
        >
          {/* Front */}
          <Face label="Question" tinted={false} hidden={flipped}>
            <MiniMarkdown content={card.front} />
          </Face>
          {/* Back */}
          <Face label="Answer" tinted hidden={!flipped} back>
            <MiniMarkdown content={card.back} />
          </Face>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        <IconButton onClick={() => go(-1)} aria-label="previous card">
          <ChevronLeftIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
          <FlipIcon sx={{ fontSize: 16 }} /> tap card to flip
        </Box>
        <IconButton onClick={() => go(1)} aria-label="next card">
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

function Face({
  label,
  tinted,
  hidden,
  back,
  children,
}: {
  label: string;
  tinted: boolean;
  hidden: boolean;
  back?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      aria-hidden={hidden}
      sx={{
        position: back ? 'absolute' : 'relative',
        inset: 0,
        backfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: tinted ? 'action.hover' : 'background.default',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="overline"
        sx={{ position: 'absolute', top: 8, left: 12, color: 'text.secondary', fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}
