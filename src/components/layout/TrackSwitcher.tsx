import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ACTIVE_TRACK_STORAGE_KEY, isTrackAvailable, tracks } from '../../modules/registry';
import type { Track } from '../../types';
import { TrackIcon } from '../TrackIcon';
import { Stack } from '../ui/Stack';

export function TrackSwitcher({ activeTrack }: { activeTrack: Track }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const choose = (track: Track) => {
    try {
      localStorage.setItem(ACTIVE_TRACK_STORAGE_KEY, track.slug);
    } catch {
      /* ignore */
    }
    setOpen(false);
    navigate(`/${track.slug}`);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outlined"
        color="inherit"
        startIcon={<TrackIcon trackId={activeTrack.id} sx={{ color: activeTrack.color }} />}
        endIcon={<ExpandMoreIcon />}
        aria-label="Switch topic"
        sx={{
          textTransform: 'none',
          borderColor: 'divider',
          borderRadius: 2,
          fontWeight: 700,
          maxWidth: { xs: 160, sm: 'none' },
          '& .MuiButton-startIcon': { mr: 0.75 },
        }}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeTrack.name}
        </Box>
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
          Choose a topic
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
              pt: 1,
            }}
          >
            {tracks.map((track) => {
              const available = isTrackAvailable(track);
              const active = track.slug === activeTrack.slug;
              return (
                <Box
                  key={track.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => choose(track)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      choose(track);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: active ? track.color : 'divider',
                    bgcolor: active ? alpha(track.color, 0.08) : 'transparent',
                    transition: 'border-color .15s, background-color .15s',
                    '&:hover': { borderColor: track.color, bgcolor: alpha(track.color, 0.06) },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(track.color, 0.15),
                        color: track.color,
                      }}
                    >
                      <TrackIcon trackId={track.id} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography sx={{ fontWeight: 700 }}>{track.name}</Typography>
                        {active && <CheckCircleIcon sx={{ fontSize: 16, color: track.color }} />}
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.75, lineHeight: 1.4 }}
                      >
                        {track.tagline}
                      </Typography>
                      {available ? (
                        <Chip
                          size="small"
                          label={`${track.allTopics.length} topics · ${track.questions.length} Qs`}
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Coming soon"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
