import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        px: 3,
      }}
    >
      <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
      <Typography variant="h4">Page not found</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        This topic doesn’t exist (yet). Use the sidebar to browse the curriculum, or head back home.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to Home
      </Button>
    </Box>
  );
}
