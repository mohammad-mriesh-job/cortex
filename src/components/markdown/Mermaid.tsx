import { useEffect, useId, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import mermaid from 'mermaid';

/** Renders a mermaid diagram from a code string, re-rendering on theme change. */
export function Mermaid({ chart }: { chart: string }) {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
      securityLevel: 'strict',
      fontFamily: theme.typography.fontFamily,
    });

    mermaid
      .render(`mermaid-${rawId}`, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [chart, theme.palette.mode, theme.typography.fontFamily, rawId]);

  if (error) {
    return (
      <Box
        component="pre"
        sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover', overflow: 'auto', fontSize: '0.8rem' }}
      >
        {chart}
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        my: 3,
        display: 'flex',
        justifyContent: 'center',
        '& svg': { maxWidth: '100%', height: 'auto' },
      }}
    />
  );
}
