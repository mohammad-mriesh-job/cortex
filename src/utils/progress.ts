import type { Topic, Track } from '../types';

/**
 * Progress is namespaced by track so that identically-slugged topics in
 * different tracks don't share a "completed" state.
 */
export function progressKey(track: Pick<Track, 'id'>, topic: Pick<Topic, 'slug'>): string {
  return `${track.id}::${topic.slug}`;
}
