import { Chip } from '@mui/material';
import type { Level } from '../types';
import { levelColor } from '../utils/levels';

export function LevelChip({
  level,
  size = 'small',
}: {
  level: Level;
  size?: 'small' | 'medium';
}) {
  return (
    <Chip
      label={level}
      size={size}
      color={levelColor(level)}
      variant="outlined"
      sx={{ fontWeight: 600, height: size === 'small' ? 20 : undefined, fontSize: size === 'small' ? '0.68rem' : undefined }}
    />
  );
}
