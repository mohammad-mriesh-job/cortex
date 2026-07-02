import { defineTrack, type QuestionModules, type RawFiles } from '../buildTrack';
import type { Track } from '../../types';

const content = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawFiles;

const questions = import.meta.glob('./questions/*.ts', {
  eager: true,
  import: 'default',
}) as QuestionModules;

export const designPatternsTrack: Track = defineTrack(
  {
    id: 'design-patterns',
    slug: 'design-patterns',
    name: 'Design Patterns',
    tagline: 'The Gang-of-Four patterns and modern idioms, with real-world examples.',
    color: '#b48ead',
  },
  content,
  questions,
);
