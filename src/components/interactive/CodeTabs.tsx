import { useMemo, useState } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';

import { parseFence } from './parse';
import { MiniMarkdown } from '../markdown/MiniMarkdown';

interface RawTab {
  label: string;
  body: string;
}
interface RawConfig {
  tabs: RawTab[];
}

export function CodeTabs({ raw }: { raw: string }) {
  const config = useMemo(() => parseFence<RawConfig>(raw), [raw]);
  const tabs = config.tabs ?? [];
  const [value, setValue] = useState(0);

  if (tabs.length === 0) return null;
  const active = tabs[Math.min(value, tabs.length - 1)];

  return (
    <Paper variant="outlined" sx={{ my: 3, borderRadius: 3, overflow: 'hidden' }}>
      <Tabs
        value={value}
        onChange={(_, v) => setValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 44, px: 1 }}
      >
        {tabs.map((t, i) => (
          <Tab key={i} label={t.label} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }} />
        ))}
      </Tabs>
      <Box sx={{ px: 2, py: 1 }}>
        <MiniMarkdown content={active.body} />
      </Box>
    </Paper>
  );
}
