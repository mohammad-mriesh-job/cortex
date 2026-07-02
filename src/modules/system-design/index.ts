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

export const systemDesignTrack: Track = defineTrack(
  {
    id: 'system-design',
    slug: 'system-design',
    name: 'System Design',
    tagline: 'Scalability, caching, queues, sharding, and designing for millions of users.',
    color: '#56b6c2',
  },
  content,
  questions,
);
