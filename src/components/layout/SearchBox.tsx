import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useActiveTrack } from '../../hooks/useActiveTrack';
import { DEFAULT_TRACK_SLUG } from '../../modules/registry';

export function SearchBox() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const track = useActiveTrack();
  const trackSlug = track?.slug ?? DEFAULT_TRACK_SLUG;

  // keep in sync when navigating to /search?q=
  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  // "/" focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q) navigate(`/${trackSlug}/search?q=${encodeURIComponent(q)}`);
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        height: 38,
        width: { xs: 150, sm: 240, md: 320 },
        borderRadius: 2,
        bgcolor: 'action.hover',
      }}
    >
      <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
      <InputBase
        inputRef={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search topics…  ( / )"
        sx={{ flex: 1, fontSize: '0.9rem' }}
        inputProps={{ 'aria-label': 'search Java topics' }}
      />
    </Paper>
  );
}
