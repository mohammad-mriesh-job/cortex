import { useParams } from 'react-router-dom';
import { trackBySlug } from '../modules/registry';
import type { Track } from '../types';

/** The track for the current `/:trackSlug/...` route, or undefined if unknown. */
export function useActiveTrack(): Track | undefined {
  const { trackSlug } = useParams();
  return trackSlug ? trackBySlug.get(trackSlug) : undefined;
}
