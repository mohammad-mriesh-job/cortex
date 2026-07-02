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

export const multithreadingTrack: Track = defineTrack(
  {
    id: 'multithreading',
    slug: 'multithreading',
    name: 'Multithreading & Concurrency',
    tagline: 'Threads, locks, memory models, and lock-free patterns across languages.',
    color: '#e06c75',
  },
  content,
  questions,
);
