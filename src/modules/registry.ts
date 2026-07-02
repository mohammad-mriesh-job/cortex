import type { Track } from '../types';
import { javaTrack } from './java';
import { dsaTrack } from './dsa';
import { oopTrack } from './oop';
import { designPatternsTrack } from './design-patterns';
import { systemDesignTrack } from './system-design';
import { databaseTrack } from './database';
import { multithreadingTrack } from './multithreading';

export { isTrackAvailable } from './buildTrack';

// Order shown in the topic switcher. Java (the populated track) leads.
export const tracks: Track[] = [
  javaTrack,
  dsaTrack,
  oopTrack,
  designPatternsTrack,
  multithreadingTrack,
  systemDesignTrack,
  databaseTrack,
];

export const trackBySlug = new Map(tracks.map((t) => [t.slug, t]));

export const DEFAULT_TRACK_SLUG = 'java';
export const ACTIVE_TRACK_STORAGE_KEY = 'active-track';
