import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type Mode = 'light' | 'dark';

interface ColorModeContextValue {
  mode: Mode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'dark',
  toggle: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const MONO =
  '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

// Java brand-inspired palette: coffee orange + steel blue.
function buildTheme(mode: Mode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#f8981d' : '#d97500' }, // Java orange
      secondary: { main: isDark ? '#6f9fc8' : '#3a6ea5' }, // Java steel blue
      success: { main: isDark ? '#5dd39e' : '#2e9e6b' },
      warning: { main: isDark ? '#f3b13b' : '#c77700' },
      error: { main: isDark ? '#f07a73' : '#cf3b32' },
      info: { main: isDark ? '#6f9fc8' : '#3a6ea5' },
      background: {
        default: isDark ? '#0e1116' : '#f6f7f9',
        paper: isDark ? '#161b22' : '#ffffff',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Roboto", system-ui, -apple-system, "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.01em' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      code: { fontFamily: MONO },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '::selection': { background: isDark ? '#f8981d55' : '#d9750055' },
          'html, body, #root': { height: '100%' },
        },
      },
      MuiCard: { defaultProps: { variant: 'outlined' } },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'default' },
        styleOverrides: {
          root: {
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${isDark ? '#21262d' : '#e2e4e8'}`,
            backgroundColor: isDark ? '#161b22cc' : '#ffffffcc',
          },
        },
      },
    },
  });
}

// allow theme.typography.code
declare module '@mui/material/styles' {
  interface TypographyVariants {
    code: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    const stored = localStorage.getItem('color-mode');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('color-mode', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
