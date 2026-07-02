import type { ReactNode } from 'react';
import { Box, Paper, Typography, alpha, useTheme } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import BugReportIcon from '@mui/icons-material/BugReportOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';

type PaletteKey = 'success' | 'info' | 'warning' | 'error' | 'secondary' | 'primary';

interface CalloutConfig {
  label: string;
  color: PaletteKey;
  Icon: typeof InfoIcon;
}

const CONFIG: Record<string, CalloutConfig> = {
  tip: { label: 'Tip', color: 'success', Icon: LightbulbIcon },
  note: { label: 'Note', color: 'info', Icon: InfoIcon },
  info: { label: 'Note', color: 'info', Icon: InfoIcon },
  warning: { label: 'Warning', color: 'warning', Icon: WarningIcon },
  gotcha: { label: 'Gotcha', color: 'error', Icon: BugReportIcon },
  senior: { label: 'Senior Insight', color: 'secondary', Icon: WorkspacePremiumIcon },
  example: { label: 'Example', color: 'primary', Icon: TerminalIcon },
  key: { label: 'Key Point', color: 'primary', Icon: KeyIcon },
};

export function Callout({ type, children }: { type?: string; children: ReactNode }) {
  const theme = useTheme();
  const config = CONFIG[(type || 'note').toLowerCase()] ?? CONFIG.note;
  const color = theme.palette[config.color].main;
  const { Icon } = config;

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 2.5,
        px: 2,
        py: 1.5,
        borderLeft: `4px solid ${color}`,
        borderColor: alpha(color, 0.4),
        backgroundColor: alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.07),
        borderRadius: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color }}>
        <Icon fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>
          {config.label}
        </Typography>
      </Box>
      <Box
        sx={{
          '& > :first-of-type': { mt: 0 },
          '& > :last-child': { mb: 0 },
          '& p': { my: 0.75 },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
