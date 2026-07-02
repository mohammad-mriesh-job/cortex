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

export const databaseTrack: Track = defineTrack(
  {
    id: 'database',
    slug: 'database',
    name: 'Databases',
    tagline: 'SQL, indexing, transactions, normalization, and the NoSQL trade-offs.',
    color: '#e0a458',
  },
  content,
  questions,
);
