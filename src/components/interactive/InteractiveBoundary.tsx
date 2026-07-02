import { Component, type ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';

interface Props {
  kind: string;
  raw: string;
  children: ReactNode;
}

/** Stops a malformed interactive block from crashing the whole page. */
export class InteractiveBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <Box
          sx={{
            my: 2.5,
            p: 2,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'warning.main',
            bgcolor: 'action.hover',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'warning.main', mb: 1 }}>
            <WarningIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Couldn’t render this “{this.props.kind}” block — check its YAML.
            </Typography>
          </Box>
          <Box
            component="pre"
            sx={{ m: 0, fontSize: '0.75rem', overflow: 'auto', whiteSpace: 'pre-wrap', opacity: 0.8 }}
          >
            {this.props.raw}
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}
