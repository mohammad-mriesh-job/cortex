import { useEffect, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import type { TocItem } from '../types';

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <Box component="nav" aria-label="On this page">
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}
      >
        On this page
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Link
              key={item.id}
              href={`#${item.id}`}
              underline="none"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', `#${item.id}`);
              }}
              sx={{
                pl: item.depth === 3 ? 2 : 0.5,
                py: 0.25,
                fontSize: '0.82rem',
                borderLeft: '2px solid',
                borderColor: active ? 'primary.main' : 'transparent',
                color: active ? 'primary.main' : 'text.secondary',
                fontWeight: active ? 600 : 400,
                transition: 'color 0.15s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {item.text}
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
