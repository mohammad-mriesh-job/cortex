import { Box } from '@mui/material';
import type { BoxProps, SxProps, Theme } from '@mui/material';
import type { ResponsiveStyleValue } from '@mui/system';
import type { ElementType, ReactNode } from 'react';

type Direction = ResponsiveStyleValue<'row' | 'row-reverse' | 'column' | 'column-reverse'>;

export interface StackProps extends Omit<BoxProps, 'direction'> {
  direction?: Direction;
  spacing?: number | string;
  alignItems?: string;
  justifyContent?: string;
  flexWrap?: string;
  /** accepted for API parity with MUI Stack; gap is always used here */
  useFlexGap?: boolean;
  component?: ElementType;
  to?: string;
  children?: ReactNode;
}

/**
 * Drop-in replacement for MUI v9 `Stack` that still accepts `alignItems`,
 * `justifyContent`, and `flexWrap` (which v9 moved to `sx`). Implemented with
 * a flex `Box` + CSS `gap`.
 */
export function Stack({
  direction = 'column',
  spacing = 0,
  alignItems,
  justifyContent,
  flexWrap,
  useFlexGap: _useFlexGap,
  sx,
  ...rest
}: StackProps) {
  const mergedSx = {
    display: 'flex',
    flexDirection: direction,
    gap: spacing,
    alignItems,
    justifyContent,
    flexWrap,
    ...(sx as object),
  } as SxProps<Theme>;

  return <Box sx={mergedSx} {...rest} />;
}
