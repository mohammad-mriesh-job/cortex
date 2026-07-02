import { defineTrack, type QuestionModules, type RawFiles } from '../buildTrack';
import type { Track } from '../../types';

// Each track globs ONLY its own folder — modules stay isolated from each other.
const content = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawFiles;

const questions = import.meta.glob('./questions/*.ts', {
  eager: true,
  import: 'default',
}) as QuestionModules;

export const javaTrack: Track = defineTrack(
  {
    id: 'java',
    slug: 'java',
    name: 'Java',
    tagline: 'From your first variable to JVM internals, concurrency, and system design.',
    color: '#f8981d',
  },
  content,
  questions,
);
